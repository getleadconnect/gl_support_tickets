<?php

namespace App\Services;

use App\Models\SmsSetting;
use App\Models\Branch;

use GuzzleHttp\Client;
use GuzzleHttp\Exception\RequestException;
use Log;
use Auth;

trait SmsApiService
{
	
	// issue register confirmation message
    // to send  service request, service completed, and ready for delivery  messages

    public function sendSmsMessages($ticket,$customer,$ticketStatus)
    {
        try
        {
            $sms=SmsSetting::where('status',1)->first();
            if(!empty($sms))
            {

                $branch=Branch::where('id',$ticket->branch_id)->first();
                if($branch) {
                    $cust_care_no=" ".$branch->country_code.$branch->customer_care_number;
                }
                else {
                    $cust_care_no=" +919388114405";
                }
            
                if($ticketStatus==1)
                {
                    $message="Dear Customer, Your order has been registered with MATRIX. Order No. :".$ticket->tracking_number." Date :".$ticket->created_at." For Item :".$ticket->description." Ph :".$cust_care_no;
                    $templateId="1207161656976713215";
                }
                else if($ticketStatus==4)
                {
                    $var1="for Delivery. Contact us at Ph:".$cust_care_no;
                    $message="Dear Customer, Your Product has ready ".$var1." Order No. :".$ticket->tracking_number;
                    $templateId="1207161656952175071";
                }
                else if($ticketStatus==3)
                {
                    $orderNo="Order No :#".$ticket->tracking_number." Delivered.";
                    $message="Dear Customer, Your order has been registered with MATRIX. ".$orderNo;
                    $templateId="1207161656965010717";
                }
                
                $data=[
                    "user_mobile"=>$customer->country_code.$customer->mobile,
                    "tracking_id"=>$ticket->tracking_number,
                    "template_id"=>$templateId,
                    "message"=>$message,
                ];

                $accessToken = $sms->api_token;
                $endpoint=$sms->sms_api;
                $accessTokenKey = "ehLu[AJEw*5iB6/aIdK(+mOz,oq)*j[8";
                
                $expire = strtotime("+15 minute");

                $timeKey = md5('send-sms'."sms@rits-v1.0".$expire);
                $timeAccessTokenKey = md5($accessToken.$timeKey);
                $signature = md5($timeAccessTokenKey.$accessTokenKey);

                $data['access_token']=$accessToken;
                $data['expire']=$expire;
                $data['auth_signature']=$signature;
                $data['route']="transactional";
                $data['sender_id']="MTRXIT";
                $data['endpoint']=$endpoint;
                
                $this->smsMessageSendToMobile($data);
            }
            else
            {
                return false;
            }
        }
        catch(\Exception $e)
        {
            \Log::info($e->getMessage());
            return false;
        }

    }

    public function smsMessageSendToMobile($params=null)
    {
        try{

            $requestParams = [
                'accessToken'           => $params['access_token'],
                'expire'                => $params['expire'],
                'authSignature'         => $params['auth_signature'],
                'route'                 => $params['route'],
                'smsHeader'             => $params['sender_id'],
                'messageContent'        => $params['message'],
                'recipients'            => $params['user_mobile'],
                'contentType'           => "text",
                'entityId'              => "1201160870399484886",
                'templateId'            => $params['template_id'],
                'removeDuplicateNumbers'=> "1",
            ];

            $client = new \GuzzleHttp\Client();
            
            $response = $client->request('POST', $params['endpoint'], [
                'headers' => [
                    'accept' => 'application/json',
                ],
                'form_params' => $requestParams
            ]);
            
            $api_response=json_decode($response->getBody(),true);
            \Log::info($api_response);

            if($api_response['status']=='success') {
                return true;
            }
            else {
                return false;
            }
        
        }
        catch(\Exception $e)
        {
            \Log::info('Sms Error:');
            \Log::info($e->getMessage());
            return false;
        }

    }

}
