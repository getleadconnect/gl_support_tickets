<?php

namespace App\Services;

use ZipArchive;
use DOMDocument;
use Exception;

class SimpleXLSXParser
{
    /**
     * Parse XLSX file and return array of rows
     */
    public static function parse($filePath)
    {
        $zip = new ZipArchive;

        if ($zip->open($filePath) !== true) {
            throw new Exception('Cannot open XLSX file');
        }

        // Read shared strings
        $sharedStrings = [];
        if (($sharedStringsXml = $zip->getFromName('xl/sharedStrings.xml')) !== false) {
            $xml = new DOMDocument();
            $xml->loadXML($sharedStringsXml, LIBXML_NOCDATA);

            foreach ($xml->getElementsByTagName('t') as $node) {
                $sharedStrings[] = $node->nodeValue;
            }
        }

        // Read worksheet
        $worksheetXml = $zip->getFromName('xl/worksheets/sheet1.xml');
        if (!$worksheetXml) {
            $zip->close();
            throw new Exception('Cannot read worksheet');
        }

        $xml = new DOMDocument();
        $xml->loadXML($worksheetXml, LIBXML_NOCDATA);

        $rows = [];
        $rowIndex = 0;

        foreach ($xml->getElementsByTagName('row') as $rowNode) {
            $cells = [];
            $cellIndex = 0;

            foreach ($rowNode->getElementsByTagName('c') as $cellNode) {
                // Get cell reference (e.g., A1, B1, etc.)
                $cellRef = $cellNode->getAttribute('r');
                $cellColumn = preg_replace('/[0-9]+/', '', $cellRef);
                $expectedColumn = self::columnIndexToLetter($cellIndex);

                // Fill empty cells
                while ($expectedColumn !== $cellColumn && $cellIndex < 26) {
                    $cells[] = '';
                    $cellIndex++;
                    $expectedColumn = self::columnIndexToLetter($cellIndex);
                }

                // Get cell value
                $value = '';
                $valueNode = $cellNode->getElementsByTagName('v')->item(0);

                if ($valueNode) {
                    $cellType = $cellNode->getAttribute('t');

                    if ($cellType === 's') {
                        // Shared string
                        $index = (int)$valueNode->nodeValue;
                        $value = isset($sharedStrings[$index]) ? $sharedStrings[$index] : '';
                    } else {
                        // Direct value
                        $value = $valueNode->nodeValue;
                    }
                }

                $cells[] = $value;
                $cellIndex++;
            }

            if (!empty(array_filter($cells))) {
                $rows[] = $cells;
            }

            $rowIndex++;
        }

        $zip->close();

        return $rows;
    }

    /**
     * Convert column index to letter (0 = A, 1 = B, etc.)
     */
    private static function columnIndexToLetter($index)
    {
        $letter = '';
        while ($index >= 0) {
            $letter = chr(65 + ($index % 26)) . $letter;
            $index = intval($index / 26) - 1;
            if ($index < 0) break;
        }
        return $letter;
    }
}