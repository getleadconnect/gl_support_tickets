<?php

namespace App\Jobs;

use App\Models\Ticket;
use Carbon\Carbon;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class SendDailyTelegramSummaryJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * Create a new job instance.
     */
    public function __construct()
    {
        //
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        try {
            $botToken = config('services.telegram.bot_token');
            $chatId = config('services.telegram.chat_id');

            if (empty($botToken) || empty($chatId)) {
                Log::warning('Daily Telegram summary: Credentials not configured');
                return;
            }

            // Get ticket statistics
            $stats = $this->getTicketStatistics();

            // Format the message
            $message = $this->formatDailySummaryMessage($stats);

            // Telegram API endpoint
            $url = "https://api.telegram.org/bot{$botToken}/sendMessage";

            // Send the message via Telegram API
            $response = Http::post($url, [
                'chat_id' => $chatId,
                'text' => $message,
                'parse_mode' => 'Markdown',
                'disable_web_page_preview' => true
            ]);

            if ($response->successful()) {
                Log::info('Daily Telegram summary sent successfully');
            } else {
                Log::error('Daily Telegram summary API error: ' . $response->body());
            }

        } catch (\Exception $e) {
            Log::error('SendDailyTelegramSummaryJob failed: ' . $e->getMessage());
        }
    }

    /**
     * Get ticket statistics for the daily summary
     *
     * @return array
     */
    private function getTicketStatistics(): array
    {
        $today = Carbon::today();

        // Total tickets (excluding soft deleted)
        $totalTickets = Ticket::count();

        // Closed tickets (status = 3)
        $closedTickets = Ticket::where('status', 3)->count();

        // Tickets created today
        $ticketsCreatedToday = Ticket::whereDate('created_at', $today)->count();

        // Tickets closed today (status = 3 and closed_at is today)
        $ticketsClosedToday = Ticket::where('status', 3)
            ->whereDate('closed_at', $today)
            ->count();

        // Open tickets (status != 3, i.e., not closed)
        $openTickets = Ticket::where('status', '!=', 3)->count();

        // Top 5 overdue tickets (status != 3 and due_date < today)
        $overdueTickets = Ticket::with(['customer', 'ticketPriority', 'branch'])
            ->where('status', '!=', 3)
            ->whereNotNull('due_date')
            ->where('due_date', '<', $today)
            ->orderBy('due_date', 'asc')
            ->limit(5)
            ->get();

        return [
            'total_tickets' => $totalTickets,
            'closed_tickets' => $closedTickets,
            'tickets_created_today' => $ticketsCreatedToday,
            'tickets_closed_today' => $ticketsClosedToday,
            'open_tickets' => $openTickets,
            'overdue_tickets' => $overdueTickets,
        ];
    }

    /**
     * Format the daily summary message for Telegram
     *
     * @param array $stats
     * @return string
     */
    private function formatDailySummaryMessage(array $stats): string
    {
        $today = Carbon::now()->format('d-m-Y');
        $time = Carbon::now()->format('h:i A');

        $message = "📊 *DAILY TICKET SUMMARY*\n";
        $message .= "━━━━━━━━━━━━━━━━━━━━━\n";
        $message .= "📅 *Date:* {$today}\n";
        $message .= "⏰ *Time:* {$time}\n\n";

        $message .= "📈 *TICKET STATISTICS*\n";
        $message .= "━━━━━━━━━━━━━━━━━━━━━\n\n";

        $message .= "📋 *Total Tickets:* " . number_format($stats['total_tickets']) . "\n";
        $message .= "✅ *Solved Tickets:* " . number_format($stats['closed_tickets']) . "\n";
        $message .= "🆕 *Created Today:* " . number_format($stats['tickets_created_today']) . "\n";
        $message .= "🏁 *Solved Today:* " . number_format($stats['tickets_closed_today']) . "\n";
        $message .= "📂 *Open Tickets:* " . number_format($stats['open_tickets']) . "\n\n";

        // Overdue tickets section
        $message .= "⚠️ *TOP 5 OVERDUE TICKETS*\n";
        $message .= "━━━━━━━━━━━━━━━━━━━━━\n\n";

        if ($stats['overdue_tickets']->count() > 0) {
            foreach ($stats['overdue_tickets'] as $index => $ticket) {
                $dueDate = Carbon::parse($ticket->due_date)->format('d-m-Y');
                $daysOverdue = Carbon::parse($ticket->due_date)->diffInDays(Carbon::today());
                $customerName = $ticket->customer ? $ticket->customer->name : 'N/A';
                $priority = $ticket->ticketPriority ? $ticket->ticketPriority->name : 'N/A';

                $issue = $ticket->issue ?? 'N/A';

                $message .= ($index + 1) . ". `" . $ticket->tracking_number . "`\n";
                $message .= "   📝 " . $issue . "\n";
                $message .= "   👤 " . $customerName . "\n";
                $message .= "   📆 Due: " . $dueDate . " (*{$daysOverdue} days overdue*)\n";
                $message .= "   ⚡ Priority: " . $priority . "\n\n";
            }
        } else {
            $message .= "🎉 *No overdue tickets!*\n\n";
        }

        $message .= "━━━━━━━━━━━━━━━━━━━━━\n";
        $message .= "🤖 _Automated Daily Report_";

        return $message;
    }
}
