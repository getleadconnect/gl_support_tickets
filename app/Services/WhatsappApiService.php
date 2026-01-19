<?php

namespace App\Services;

use App\Models\Company;
use App\Models\MessageSetting;
use App\Models\Branch;
use App\Models\Customer;


use App\Jobs\SendWhatsAppMessageJob;
use Log;
use Auth;

trait WhatsappApiService
{
	
	// issue register confirmation message

    // to send  service request, service completed, and ready for delivery  messages

    public function sendWhatsappServiceMessages($ticket,$ticketStatus)
    {

        try
        {

            $branch=Branch::where('id',$ticket->branch_id)->first();
            
            if($branch){
                $cust_care_no=" ".$branch->country_code.$branch->customer_care_number;
            }
            else {
                $cust_care_no=" +919388114405";
            }

            $mset=MessageSetting::where('status',1)->first();
            if(!empty($mset))
            {
 
               $customer=Customer::where('id',$ticket->customer_id)->first();

                $data=[
                        "customer_name"=>$customer->name,
                        "user_mobile"=>$customer->country_code.$customer->mobile,
                        "tracking_id"=>$ticket->tracking_number,
                        "branch_id"=>$ticket->branch_id,
                        "delivered_date"=>null,
                        "delivery_text"=>null,
                     ];

                if($ticketStatus==1){
                    $data["template_id"]="259094"; //new tickte message wabis id
                }
                else if($ticketStatus==4)
                {
                    $data["template_id"]="259096"; //completed message wabis id
                }
                else if($ticketStatus==3)
                {
                    $data["template_id"]="259187"; //delivered message wabis id
                    $data["delivered_date"]=date('d-m-Y');
                    $data["delivery_text"]="Your device/service request with *ID: ".$ticket->tracking_number;
                }

                $data['endpoint'] = $mset->whatsapp_api;
                $data['api_token']=$mset->api_token;
                $data['phone_number_id']=$mset->phone_number_id;
                $data['customer_care']=$cust_care_no??"-";

                SendWhatsAppMessageJob::dispatch($data);
            }
            else
            {
                \Log::info("Api details not found in message_settings table.!");
            }
        }
        catch(\Exception $e)
        {
            \Log::info($e->getMessage());
        }

    }

}
