<?php

namespace App\Http\Controllers;

use App\Models\QRCode;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use BaconQrCode\Renderer\ImageRenderer;
use BaconQrCode\Renderer\Image\SvgImageBackEnd;
use BaconQrCode\Renderer\RendererStyle\RendererStyle;
use BaconQrCode\Writer;

class QRCodeController extends Controller
{
    /**
     * Display a listing of the QR codes.
     */
    public function index()
    {
        $qrcodes = QRCode::with('creator:id,name')
            ->orderBy('created_at', 'desc')
            ->get();
        
        return response()->json($qrcodes);
    }

    /**
     * Generate and store a new QR code using BaconQrCode library.
     */
    public function generate(Request $request)
    {
        $validated = $request->validate([
            'web_link' => 'required|url|max:500'
        ]);

        try {
            // Generate unique filename
            $filename = 'qr_' . time() . '_' . Str::random(10) . '.svg';
            $filepath = 'uploads/qrcode/' . $filename;
            
            // Create directory if it doesn't exist
            $publicPath = public_path('uploads/qrcode');
            if (!file_exists($publicPath)) {
                mkdir($publicPath, 0777, true);
            }

            // Use BaconQrCode to generate QR code as SVG (no image library required)
            $renderer = new ImageRenderer(
                new RendererStyle(300, 2),
                new SvgImageBackEnd()
            );
            
            $writer = new Writer($renderer);
            $qrCode = $writer->writeString($validated['web_link']);
            
            // Save QR code as SVG
            file_put_contents(public_path($filepath), $qrCode);

            // Save to database
            $qrcodeRecord = QRCode::create([
                'web_link' => $validated['web_link'],
                'qrcode_file' => $filepath,
                'created_by' => auth()->id() ?? 1
            ]);

            // Load creator relationship
            $qrcodeRecord->load('creator:id,name');

            return response()->json([
                'success' => true,
                'message' => 'QR code generated successfully',
                'qrcode' => $qrcodeRecord
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to generate QR code',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Delete a QR code.
     */
    public function destroy($id)
    {
        try {
            $qrcode = QRCode::findOrFail($id);
            
            // Delete the file if it exists
            if (file_exists(public_path($qrcode->qrcode_file))) {
                unlink(public_path($qrcode->qrcode_file));
            }
            
            // Delete the database record
            $qrcode->delete();

            return response()->json([
                'success' => true,
                'message' => 'QR code deleted successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete QR code',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}