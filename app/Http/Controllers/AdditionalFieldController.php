<?php

namespace App\Http\Controllers;

use App\Models\AdditionalField;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;

class AdditionalFieldController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        try {
            $query = AdditionalField::orderBy('created_at', 'desc');
            
            // Add search functionality if needed
            if ($request->has('search') && $request->search) {
                $query->where(function($q) use ($request) {
                    $q->where('title', 'like', '%' . $request->search . '%')
                      ->orWhere('name', 'like', '%' . $request->search . '%');
                });
            }
            
            $fields = $query->get();
            
            // Transform the data to match frontend expectations
            $fields = $fields->map(function($field) {
                return [
                    'id' => $field->id,
                    'title' => $field->title,
                    'name' => $field->name,
                    'type' => $field->type,
                    'type_label' => $this->getTypeLabel($field->type),
                    'mandatory' => $field->mandatory,
                    'show_filter' => $field->show_filter,
                    'show_list' => $field->show_list,
                    'value' => $field->value,
                    'user_id' => $field->user_id,
                    'created_at' => $field->created_at,
                    'updated_at' => $field->updated_at
                ];
            });
            
            return response()->json($fields);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Failed to fetch additional fields'], 500);
        }
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'title' => 'required|string|max:255',
                'name' => 'required|string|max:255|unique:additional_fields,name',
                'type' => 'required|in:1,2,3', // 1=select, 2=text, 3=date
                'mandatory' => 'boolean',
                'show_filter' => 'boolean',
                'show_list' => 'boolean',
                'selection' => 'nullable|string|in:single,multiple',
                'value' => 'nullable|array', // For select options
            ]);

            // For select type, ensure values are provided
            if ($validated['type'] == '1' && empty($validated['value'])) {
                return response()->json([
                    'message' => 'Select values are required for SELECT field type'
                ], 422);
            }

            // Format select values with id and value structure
            $formattedValues = null;
            if ($validated['type'] == '1' && !empty($validated['value'])) {
                $formattedValues = array_values(array_map(function($value, $index) {
                    return [
                        'id' => $index + 1,
                        'value' => $value
                    ];
                }, $validated['value'], array_keys($validated['value'])));
            }

            $additionalField = AdditionalField::create([
                'title' => $validated['title'],
                'name' => $validated['name'],
                'type' => $this->getTypeString($validated['type']),
                'selection' => $validated['type'] == '1' ? ($validated['selection'] ?? 'single') : null,
                'mandatory' => $validated['mandatory'] ?? 0,
                'show_filter' => $validated['show_filter'] ?? 0,
                'show_list' => $validated['show_list'] ?? 0,
                'value' => $formattedValues,
                'user_id' => Auth::id(),
            ]);

            return response()->json($additionalField, 201);

        } catch (ValidationException $e) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to create additional field: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(AdditionalField $additionalField)
    {
        try {
            return response()->json($additionalField);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Additional field not found'], 404);
        }
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, AdditionalField $additionalField)
    {
        try {
            $validated = $request->validate([
                'title' => 'required|string|max:255',
                'name' => 'required|string|max:255|unique:additional_fields,name,' . $additionalField->id,
                'type' => 'required|in:1,2,3',
                'mandatory' => 'boolean',
                'show_filter' => 'boolean',
                'show_list' => 'boolean',
                'selection' => 'nullable|string|in:single,multiple',
                'value' => 'nullable|array',
            ]);

            // For select type, ensure values are provided
            if ($validated['type'] == '1' && empty($validated['value'])) {
                return response()->json([
                    'message' => 'Select values are required for SELECT field type'
                ], 422);
            }

            // Format select values with id and value structure
            $formattedValues = null;
            if ($validated['type'] == '1' && !empty($validated['value'])) {
                $formattedValues = array_values(array_map(function($value, $index) {
                    return [
                        'id' => $index + 1,
                        'value' => $value
                    ];
                }, $validated['value'], array_keys($validated['value'])));
            }

            $additionalField->update([
                'title' => $validated['title'],
                'name' => $validated['name'],
                'type' => $this->getTypeString($validated['type']),
                'selection' => $validated['type'] == '1' ? ($validated['selection'] ?? 'single') : null,
                'mandatory' => $validated['mandatory'] ?? 0,
                'show_filter' => $validated['show_filter'] ?? 0,
                'show_list' => $validated['show_list'] ?? 0,
                'value' => $formattedValues,
            ]);

            return response()->json($additionalField);

        } catch (ValidationException $e) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to update additional field'
            ], 500);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(AdditionalField $additionalField)
    {
        try {
            // Check if field is being used by tickets
            $ticketCount = $additionalField->tickets()->count();
            
            if ($ticketCount > 0) {
                return response()->json([
                    'message' => "Cannot delete field. It is being used by {$ticketCount} ticket(s)."
                ], 422);
            }

            $additionalField->delete();

            return response()->json(['message' => 'Additional field deleted successfully']);

        } catch (\Exception $e) {
            \Log::error('Failed to delete additional field: ' . $e->getMessage());
            return response()->json([
                'message' => 'Failed to delete additional field'
            ], 500);
        }
    }

    /**
     * Convert type number to string
     */
    private function getTypeString($type)
    {
        switch($type) {
            case '1':
                return 'select';
            case '2':
                return 'text';
            case '3':
                return 'date';
            default:
                return 'text';
        }
    }

    /**
     * Get type label for display
     */
    private function getTypeLabel($type)
    {
        switch($type) {
            case 'select':
                return 'Select';
            case 'text':
                return 'Text';
            case 'date':
                return 'Date';
            default:
                return ucfirst($type);
        }
    }
}