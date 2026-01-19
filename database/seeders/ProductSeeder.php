<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Product;
use App\Models\Category;
use App\Models\Brand;

class ProductSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create brands first
        $brands = [
            ['brand' => 'Dell', 'created_by' => 1],
            ['brand' => 'HP', 'created_by' => 1],
            ['brand' => 'Microsoft', 'created_by' => 1],
            ['brand' => 'Apple', 'created_by' => 1],
            ['brand' => 'Lenovo', 'created_by' => 1],
        ];

        foreach ($brands as $brand) {
            Brand::firstOrCreate(['brand' => $brand['brand']], $brand);
        }

        // Get brand IDs
        $dellId = Brand::where('brand', 'Dell')->first()->id;
        $hpId = Brand::where('brand', 'HP')->first()->id;
        $microsoftId = Brand::where('brand', 'Microsoft')->first()->id;
        $appleId = Brand::where('brand', 'Apple')->first()->id;
        $lenovoId = Brand::where('brand', 'Lenovo')->first()->id;

        // Create categories
        $categories = [
            ['category' => 'Electronics', 'brand_id' => $dellId, 'created_by' => 1],
            ['category' => 'Software', 'brand_id' => $microsoftId, 'created_by' => 1],
            ['category' => 'Hardware', 'brand_id' => $dellId, 'created_by' => 1],
            ['category' => 'Accessories', 'brand_id' => $appleId, 'created_by' => 1],
        ];

        foreach ($categories as $category) {
            Category::firstOrCreate(['category' => $category['category']], $category);
        }

        // Get category IDs
        $electronicsId = Category::where('category', 'Electronics')->first()->id;
        $softwareId = Category::where('category', 'Software')->first()->id;
        $hardwareId = Category::where('category', 'Hardware')->first()->id;
        $accessoriesId = Category::where('category', 'Accessories')->first()->id;

        // Create products
        $products = [
            [
                'name' => 'Dell Latitude 5520',
                'code' => 'DL5520',
                'cost' => 75000,
                'stock' => 15,
                'initial_stock' => 15,
                'category_id' => $electronicsId,
                'brand_id' => $dellId,
                'status' => 1,
                'created_by' => 1
            ],
            [
                'name' => 'HP ProBook 450 G8',
                'code' => 'HP450G8',
                'cost' => 65000,
                'stock' => 8,
                'initial_stock' => 8,
                'category_id' => $electronicsId,
                'brand_id' => $hpId,
                'status' => 1,
                'created_by' => 1
            ],
            [
                'name' => 'Microsoft Office 365',
                'code' => 'MS365',
                'cost' => 10000,
                'stock' => 100,
                'initial_stock' => 100,
                'category_id' => $softwareId,
                'brand_id' => $microsoftId,
                'status' => 1,
                'created_by' => 1
            ],
            [
                'name' => 'Apple Magic Mouse',
                'code' => 'APMM2',
                'cost' => 7000,
                'stock' => 25,
                'initial_stock' => 25,
                'category_id' => $accessoriesId,
                'brand_id' => $appleId,
                'status' => 1,
                'created_by' => 1
            ],
            [
                'name' => 'Lenovo ThinkPad X1 Carbon',
                'code' => 'LTX1C9',
                'cost' => 120000,
                'stock' => 5,
                'initial_stock' => 5,
                'category_id' => $electronicsId,
                'brand_id' => $lenovoId,
                'status' => 1,
                'created_by' => 1
            ],
            [
                'name' => 'Dell 24" Monitor',
                'code' => 'DM24FHD',
                'cost' => 15000,
                'stock' => 12,
                'initial_stock' => 12,
                'category_id' => $hardwareId,
                'brand_id' => $dellId,
                'status' => 1,
                'created_by' => 1
            ],
            [
                'name' => 'HP LaserJet Pro',
                'code' => 'HPLJ400',
                'cost' => 28000,
                'stock' => 7,
                'initial_stock' => 7,
                'category_id' => $hardwareId,
                'brand_id' => $hpId,
                'status' => 1,
                'created_by' => 1
            ],
            [
                'name' => 'Microsoft Windows 11 Pro',
                'code' => 'WIN11P',
                'cost' => 16000,
                'stock' => 50,
                'initial_stock' => 50,
                'category_id' => $softwareId,
                'brand_id' => $microsoftId,
                'status' => 1,
                'created_by' => 1
            ],
            [
                'name' => 'Apple AirPods Pro',
                'code' => 'AAPPRO',
                'cost' => 20000,
                'stock' => 20,
                'initial_stock' => 20,
                'category_id' => $accessoriesId,
                'brand_id' => $appleId,
                'status' => 1,
                'created_by' => 1
            ],
            [
                'name' => 'Lenovo USB-C Dock',
                'code' => 'LDOCK2',
                'cost' => 12000,
                'stock' => 10,
                'initial_stock' => 10,
                'category_id' => $accessoriesId,
                'brand_id' => $lenovoId,
                'status' => 1,
                'created_by' => 1
            ]
        ];

        foreach ($products as $product) {
            Product::create($product);
        }
    }
}