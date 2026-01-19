<?php

namespace App\Jobs;

/*use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Support\Facades\Log;
use GuzzleHttp\Client;
use GuzzleHttp\Exception\RequestException;*/

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use GuzzleHttp\Client;
use GuzzleHttp\Exception\RequestException;


class SendWhatsAppMessageJob implements ShouldQueue
{
    //use Queueable, Dispatchable;
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected $data;
    
    /**
     * Create a new job instance.
     */
    public function __construct($data)
    {
        $this->data=$data;

        \Log::info($this->data);
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
     
        try{
    
            $client = new \GuzzleHttp\Client();
            if($this->data['delivered_date']!=null or $this->data['delivered_date']!="" or $this->data['delivery_text']!="")
            {
                    $params=[
                        "apiToken"=>$this->data['api_token'],
                        "phone_number_id"=>$this->data['phone_number_id'],
                        "template_id"=>$this->data['template_id'],
                        "templateVariable-customerName-1"=>$this->data['customer_name'],
                        "templateVariable-deliveryText-2"=>$this->data['delivery_text'],
                        "templateVariable-deliveryDate-3"=>$this->data['delivered_date'],
                        "phone_number"=>$this->data['user_mobile'] 
                    ];
            }
            else
            {
                    $params=[
                        "apiToken"=>$this->data['api_token'],
                        "phone_number_id"=>$this->data['phone_number_id'],
                        "template_id"=>$this->data['template_id'],
                        "templateVariable-customerName-1"=>$this->data['customer_name'],
                        "templateVariable-serviceId-2"=>$this->data['tracking_id'],
                        "templateVariable-branchContactMobile-3"=>$this->data['customer_care'],
                        "phone_number"=>$this->data['user_mobile'] 
                    ];

            }
            $response = $client->request('GET', $this->data['endpoint'], ['query' => $params]);
            $statusCode = $response->getStatusCode();
            //$content = $response->getBody()->getContents();
            $content=json_decode($response->getBody()->getContents(), true);

		    \Log::info($content);
        }
        catch(\Exception $ex)
        {
            \Log::info($ex->getMessage());
        }
        catch(RequestException $e)
        {
            \Log::info('Failed to send WhatsApp message', [
                'response' => $e->hasResponse() ? $e->getResponse()->getBody()->getContents() : null,
            ]);
        }
        
    }
}
