import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { DashboardLayout } from '@/components/dashboard-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogOverlay,
  DialogPortal,
} from '@/components/ui/dialog';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Plus,
  Search,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  X,
  Lock,
  QrCode,
  ExternalLink,
  Download,
  Eye,
  Copy,
  User,
  Package,
  FolderOpen,
  Building2,
  Briefcase,
  Tags,
  Database,
  MessageCircle,
  Eye as EyeIcon,
  EyeOff,
  RefreshCw,
  MapPin,
  UserPlus,
  Bell,
  Send
} from 'lucide-react';

interface User {
  id: number;
  name: string;
  email: string;
  role: number;
  status: number;
  created_at: string;
  updated_at: string;
  role_id?: number;
  department?: any;
  designation?: any;
  branch?: {
    id: number;
    branch_name: string;
  };
  branch_id?: number;
  department_id?: number;
  designation_id?: number;
  assigned_agents_count?: number;
}

interface Role {
  id: number;
  name: string;
  description: string | null;
  permissions: string[] | null;
  users_count?: number;
  created_at: string;
  updated_at: string;
}

interface Brand {
  id: number;
  brand: string;
  created_by: number;
  created_at: string;
  updated_at: string;
}

interface Category {
  id: number;
  category: string;
  brand_id: number;
  created_by: number;
  created_at: string;
  updated_at: string;
  brand?: {
    id: number;
    brand: string;
  };
}

interface Department {
  id: number;
  department_name: string;
  created_by: number;
  created_at: string;
  updated_at: string;
  creator?: {
    id: number;
    name: string;
  };
}

interface Designation {
  id: number;
  designation_name: string;
  created_by: number;
  created_at: string;
  updated_at: string;
  creator?: {
    id: number;
    name: string;
  };
}

interface Branch {
  id: number;
  branch_name: string;
  address?: string;
  country_code?: string;
  customer_care_number?: string;
  created_by: number;
  created_at: string;
  updated_at: string;
  tickets_count?: number;
  created_by?: {
    id: number;
    name: string;
  };
}

interface TicketLabel {
  id: number;
  label_name: string;
  color: string;
  active: boolean;
  created_by: number;
  created_at: string;
  updated_at: string;
  creator?: {
    id: number;
    name: string;
  };
}

interface QRCodeItem {
  id: number;
  web_link: string;
  qrcode_file: string;
  created_by: number;
  created_at: string;
  updated_at: string;
  creator?: {
    id: number;
    name: string;
  };
}

interface AdditionalField {
  id: number;
  title: string;
  name: string;
  type: string;
  type_label?: string;
  selection?: string | null;
  mandatory: number;
  show_filter: number;
  show_list: number;
  value: Array<{id: number; value: string}> | null;
  user_id: number;
  created_at: string;
  updated_at: string;
}

interface MessageSetting {
  id: number;
  message_type: string;
  whatsapp_api: string | null;
  token: string | null;
  phone_number_id: string | null;
  secret_key: string | null;
  template_name: string | null;
  template_text: string | null;
  status: boolean;
  created_by: number | null;
  created_at: string;
  updated_at: string;
  masked_token?: string;
  masked_secret_key?: string;
  created_by_user?: {
    id: number;
    name: string;
  };
}

interface SmsSetting {
  id: number;
  vendor_name: string | null;
  sms_api: string | null;
  api_token: string | null;
  sender_id: string | null;
  status: boolean;
  created_by: number | null;
  created_at: string;
  updated_at: string;
  masked_token?: string;
  created_by_user?: {
    id: number;
    name: string;
  };
}

interface TelegramNotificationSetting {
  id: number;
  event_type: string;
  event_name: string;
  description: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface CompanyLogo {
  id: number;
  logo_image: string;
  name: string | null;
  type: 'Logo' | 'Favicon';
  is_active: boolean;
  created_by: number;
  created_at: string;
  updated_at: string;
  creator?: {
    id: number;
    name: string;
  };
}

// Country codes with flags for dropdown - All countries
const COUNTRY_CODES = [
  { code: '+93', name: 'Afghanistan', flag: '🇦🇫' },
  { code: '+355', name: 'Albania', flag: '🇦🇱' },
  { code: '+213', name: 'Algeria', flag: '🇩🇿' },
  { code: '+1-684', name: 'American Samoa', flag: '🇦🇸' },
  { code: '+376', name: 'Andorra', flag: '🇦🇩' },
  { code: '+244', name: 'Angola', flag: '🇦🇴' },
  { code: '+1-264', name: 'Anguilla', flag: '🇦🇮' },
  { code: '+672', name: 'Antarctica', flag: '🇦🇶' },
  { code: '+1-268', name: 'Antigua and Barbuda', flag: '🇦🇬' },
  { code: '+54', name: 'Argentina', flag: '🇦🇷' },
  { code: '+374', name: 'Armenia', flag: '🇦🇲' },
  { code: '+297', name: 'Aruba', flag: '🇦🇼' },
  { code: '+61', name: 'Australia', flag: '🇦🇺' },
  { code: '+43', name: 'Austria', flag: '🇦🇹' },
  { code: '+994', name: 'Azerbaijan', flag: '🇦🇿' },
  { code: '+1-242', name: 'Bahamas', flag: '🇧🇸' },
  { code: '+973', name: 'Bahrain', flag: '🇧🇭' },
  { code: '+880', name: 'Bangladesh', flag: '🇧🇩' },
  { code: '+1-246', name: 'Barbados', flag: '🇧🇧' },
  { code: '+375', name: 'Belarus', flag: '🇧🇾' },
  { code: '+32', name: 'Belgium', flag: '🇧🇪' },
  { code: '+501', name: 'Belize', flag: '🇧🇿' },
  { code: '+229', name: 'Benin', flag: '🇧🇯' },
  { code: '+1-441', name: 'Bermuda', flag: '🇧🇲' },
  { code: '+975', name: 'Bhutan', flag: '🇧🇹' },
  { code: '+591', name: 'Bolivia', flag: '🇧🇴' },
  { code: '+387', name: 'Bosnia and Herzegovina', flag: '🇧🇦' },
  { code: '+267', name: 'Botswana', flag: '🇧🇼' },
  { code: '+55', name: 'Brazil', flag: '🇧🇷' },
  { code: '+246', name: 'British Indian Ocean Territory', flag: '🇮🇴' },
  { code: '+1-284', name: 'British Virgin Islands', flag: '🇻🇬' },
  { code: '+673', name: 'Brunei', flag: '🇧🇳' },
  { code: '+359', name: 'Bulgaria', flag: '🇧🇬' },
  { code: '+226', name: 'Burkina Faso', flag: '🇧🇫' },
  { code: '+257', name: 'Burundi', flag: '🇧🇮' },
  { code: '+855', name: 'Cambodia', flag: '🇰🇭' },
  { code: '+237', name: 'Cameroon', flag: '🇨🇲' },
  { code: '+1', name: 'Canada', flag: '🇨🇦' },
  { code: '+238', name: 'Cape Verde', flag: '🇨🇻' },
  { code: '+1-345', name: 'Cayman Islands', flag: '🇰🇾' },
  { code: '+236', name: 'Central African Republic', flag: '🇨🇫' },
  { code: '+235', name: 'Chad', flag: '🇹🇩' },
  { code: '+56', name: 'Chile', flag: '🇨🇱' },
  { code: '+86', name: 'China', flag: '🇨🇳' },
  { code: '+61', name: 'Christmas Island', flag: '🇨🇽' },
  { code: '+61', name: 'Cocos Islands', flag: '🇨🇨' },
  { code: '+57', name: 'Colombia', flag: '🇨🇴' },
  { code: '+269', name: 'Comoros', flag: '🇰🇲' },
  { code: '+682', name: 'Cook Islands', flag: '🇨🇰' },
  { code: '+506', name: 'Costa Rica', flag: '🇨🇷' },
  { code: '+385', name: 'Croatia', flag: '🇭🇷' },
  { code: '+53', name: 'Cuba', flag: '🇨🇺' },
  { code: '+599', name: 'Curacao', flag: '🇨🇼' },
  { code: '+357', name: 'Cyprus', flag: '🇨🇾' },
  { code: '+420', name: 'Czech Republic', flag: '🇨🇿' },
  { code: '+243', name: 'Democratic Republic of the Congo', flag: '🇨🇩' },
  { code: '+45', name: 'Denmark', flag: '🇩🇰' },
  { code: '+253', name: 'Djibouti', flag: '🇩🇯' },
  { code: '+1-767', name: 'Dominica', flag: '🇩🇲' },
  { code: '+1-809', name: 'Dominican Republic', flag: '🇩🇴' },
  { code: '+670', name: 'East Timor', flag: '🇹🇱' },
  { code: '+593', name: 'Ecuador', flag: '🇪🇨' },
  { code: '+20', name: 'Egypt', flag: '🇪🇬' },
  { code: '+503', name: 'El Salvador', flag: '🇸🇻' },
  { code: '+240', name: 'Equatorial Guinea', flag: '🇬🇶' },
  { code: '+291', name: 'Eritrea', flag: '🇪🇷' },
  { code: '+372', name: 'Estonia', flag: '🇪🇪' },
  { code: '+251', name: 'Ethiopia', flag: '🇪🇹' },
  { code: '+500', name: 'Falkland Islands', flag: '🇫🇰' },
  { code: '+298', name: 'Faroe Islands', flag: '🇫🇴' },
  { code: '+679', name: 'Fiji', flag: '🇫🇯' },
  { code: '+358', name: 'Finland', flag: '🇫🇮' },
  { code: '+33', name: 'France', flag: '🇫🇷' },
  { code: '+689', name: 'French Polynesia', flag: '🇵🇫' },
  { code: '+241', name: 'Gabon', flag: '🇬🇦' },
  { code: '+220', name: 'Gambia', flag: '🇬🇲' },
  { code: '+995', name: 'Georgia', flag: '🇬🇪' },
  { code: '+49', name: 'Germany', flag: '🇩🇪' },
  { code: '+233', name: 'Ghana', flag: '🇬🇭' },
  { code: '+350', name: 'Gibraltar', flag: '🇬🇮' },
  { code: '+30', name: 'Greece', flag: '🇬🇷' },
  { code: '+299', name: 'Greenland', flag: '🇬🇱' },
  { code: '+1-473', name: 'Grenada', flag: '🇬🇩' },
  { code: '+1-671', name: 'Guam', flag: '🇬🇺' },
  { code: '+502', name: 'Guatemala', flag: '🇬🇹' },
  { code: '+44-1481', name: 'Guernsey', flag: '🇬🇬' },
  { code: '+224', name: 'Guinea', flag: '🇬🇳' },
  { code: '+245', name: 'Guinea-Bissau', flag: '🇬🇼' },
  { code: '+592', name: 'Guyana', flag: '🇬🇾' },
  { code: '+509', name: 'Haiti', flag: '🇭🇹' },
  { code: '+504', name: 'Honduras', flag: '🇭🇳' },
  { code: '+852', name: 'Hong Kong', flag: '🇭🇰' },
  { code: '+36', name: 'Hungary', flag: '🇭🇺' },
  { code: '+354', name: 'Iceland', flag: '🇮🇸' },
  { code: '+91', name: 'India', flag: '🇮🇳' },
  { code: '+62', name: 'Indonesia', flag: '🇮🇩' },
  { code: '+98', name: 'Iran', flag: '🇮🇷' },
  { code: '+964', name: 'Iraq', flag: '🇮🇶' },
  { code: '+353', name: 'Ireland', flag: '🇮🇪' },
  { code: '+44-1624', name: 'Isle of Man', flag: '🇮🇲' },
  { code: '+972', name: 'Israel', flag: '🇮🇱' },
  { code: '+39', name: 'Italy', flag: '🇮🇹' },
  { code: '+225', name: 'Ivory Coast', flag: '🇨🇮' },
  { code: '+1-876', name: 'Jamaica', flag: '🇯🇲' },
  { code: '+81', name: 'Japan', flag: '🇯🇵' },
  { code: '+44-1534', name: 'Jersey', flag: '🇯🇪' },
  { code: '+962', name: 'Jordan', flag: '🇯🇴' },
  { code: '+7', name: 'Kazakhstan', flag: '🇰🇿' },
  { code: '+254', name: 'Kenya', flag: '🇰🇪' },
  { code: '+686', name: 'Kiribati', flag: '🇰🇮' },
  { code: '+383', name: 'Kosovo', flag: '🇽🇰' },
  { code: '+965', name: 'Kuwait', flag: '🇰🇼' },
  { code: '+996', name: 'Kyrgyzstan', flag: '🇰🇬' },
  { code: '+856', name: 'Laos', flag: '🇱🇦' },
  { code: '+371', name: 'Latvia', flag: '🇱🇻' },
  { code: '+961', name: 'Lebanon', flag: '🇱🇧' },
  { code: '+266', name: 'Lesotho', flag: '🇱🇸' },
  { code: '+231', name: 'Liberia', flag: '🇱🇷' },
  { code: '+218', name: 'Libya', flag: '🇱🇾' },
  { code: '+423', name: 'Liechtenstein', flag: '🇱🇮' },
  { code: '+370', name: 'Lithuania', flag: '🇱🇹' },
  { code: '+352', name: 'Luxembourg', flag: '🇱🇺' },
  { code: '+853', name: 'Macao', flag: '🇲🇴' },
  { code: '+389', name: 'Macedonia', flag: '🇲🇰' },
  { code: '+261', name: 'Madagascar', flag: '🇲🇬' },
  { code: '+265', name: 'Malawi', flag: '🇲🇼' },
  { code: '+60', name: 'Malaysia', flag: '🇲🇾' },
  { code: '+960', name: 'Maldives', flag: '🇲🇻' },
  { code: '+223', name: 'Mali', flag: '🇲🇱' },
  { code: '+356', name: 'Malta', flag: '🇲🇹' },
  { code: '+692', name: 'Marshall Islands', flag: '🇲🇭' },
  { code: '+222', name: 'Mauritania', flag: '🇲🇷' },
  { code: '+230', name: 'Mauritius', flag: '🇲🇺' },
  { code: '+262', name: 'Mayotte', flag: '🇾🇹' },
  { code: '+52', name: 'Mexico', flag: '🇲🇽' },
  { code: '+691', name: 'Micronesia', flag: '🇫🇲' },
  { code: '+373', name: 'Moldova', flag: '🇲🇩' },
  { code: '+377', name: 'Monaco', flag: '🇲🇨' },
  { code: '+976', name: 'Mongolia', flag: '🇲🇳' },
  { code: '+382', name: 'Montenegro', flag: '🇲🇪' },
  { code: '+1-664', name: 'Montserrat', flag: '🇲🇸' },
  { code: '+212', name: 'Morocco', flag: '🇲🇦' },
  { code: '+258', name: 'Mozambique', flag: '🇲🇿' },
  { code: '+95', name: 'Myanmar', flag: '🇲🇲' },
  { code: '+264', name: 'Namibia', flag: '🇳🇦' },
  { code: '+674', name: 'Nauru', flag: '🇳🇷' },
  { code: '+977', name: 'Nepal', flag: '🇳🇵' },
  { code: '+31', name: 'Netherlands', flag: '🇳🇱' },
  { code: '+687', name: 'New Caledonia', flag: '🇳🇨' },
  { code: '+64', name: 'New Zealand', flag: '🇳🇿' },
  { code: '+505', name: 'Nicaragua', flag: '🇳🇮' },
  { code: '+227', name: 'Niger', flag: '🇳🇪' },
  { code: '+234', name: 'Nigeria', flag: '🇳🇬' },
  { code: '+683', name: 'Niue', flag: '🇳🇺' },
  { code: '+850', name: 'North Korea', flag: '🇰🇵' },
  { code: '+1-670', name: 'Northern Mariana Islands', flag: '🇲🇵' },
  { code: '+47', name: 'Norway', flag: '🇳🇴' },
  { code: '+968', name: 'Oman', flag: '🇴🇲' },
  { code: '+92', name: 'Pakistan', flag: '🇵🇰' },
  { code: '+680', name: 'Palau', flag: '🇵🇼' },
  { code: '+970', name: 'Palestine', flag: '🇵🇸' },
  { code: '+507', name: 'Panama', flag: '🇵🇦' },
  { code: '+675', name: 'Papua New Guinea', flag: '🇵🇬' },
  { code: '+595', name: 'Paraguay', flag: '🇵🇾' },
  { code: '+51', name: 'Peru', flag: '🇵🇪' },
  { code: '+63', name: 'Philippines', flag: '🇵🇭' },
  { code: '+64', name: 'Pitcairn', flag: '🇵🇳' },
  { code: '+48', name: 'Poland', flag: '🇵🇱' },
  { code: '+351', name: 'Portugal', flag: '🇵🇹' },
  { code: '+1-787', name: 'Puerto Rico', flag: '🇵🇷' },
  { code: '+974', name: 'Qatar', flag: '🇶🇦' },
  { code: '+242', name: 'Republic of the Congo', flag: '🇨🇬' },
  { code: '+262', name: 'Reunion', flag: '🇷🇪' },
  { code: '+40', name: 'Romania', flag: '🇷🇴' },
  { code: '+7', name: 'Russia', flag: '🇷🇺' },
  { code: '+250', name: 'Rwanda', flag: '🇷🇼' },
  { code: '+590', name: 'Saint Barthelemy', flag: '🇧🇱' },
  { code: '+290', name: 'Saint Helena', flag: '🇸🇭' },
  { code: '+1-869', name: 'Saint Kitts and Nevis', flag: '🇰🇳' },
  { code: '+1-758', name: 'Saint Lucia', flag: '🇱🇨' },
  { code: '+590', name: 'Saint Martin', flag: '🇲🇫' },
  { code: '+508', name: 'Saint Pierre and Miquelon', flag: '🇵🇲' },
  { code: '+1-784', name: 'Saint Vincent and the Grenadines', flag: '🇻🇨' },
  { code: '+685', name: 'Samoa', flag: '🇼🇸' },
  { code: '+378', name: 'San Marino', flag: '🇸🇲' },
  { code: '+239', name: 'Sao Tome and Principe', flag: '🇸🇹' },
  { code: '+966', name: 'Saudi Arabia', flag: '🇸🇦' },
  { code: '+221', name: 'Senegal', flag: '🇸🇳' },
  { code: '+381', name: 'Serbia', flag: '🇷🇸' },
  { code: '+248', name: 'Seychelles', flag: '🇸🇨' },
  { code: '+232', name: 'Sierra Leone', flag: '🇸🇱' },
  { code: '+65', name: 'Singapore', flag: '🇸🇬' },
  { code: '+1-721', name: 'Sint Maarten', flag: '🇸🇽' },
  { code: '+421', name: 'Slovakia', flag: '🇸🇰' },
  { code: '+386', name: 'Slovenia', flag: '🇸🇮' },
  { code: '+677', name: 'Solomon Islands', flag: '🇸🇧' },
  { code: '+252', name: 'Somalia', flag: '🇸🇴' },
  { code: '+27', name: 'South Africa', flag: '🇿🇦' },
  { code: '+82', name: 'South Korea', flag: '🇰🇷' },
  { code: '+211', name: 'South Sudan', flag: '🇸🇸' },
  { code: '+34', name: 'Spain', flag: '🇪🇸' },
  { code: '+94', name: 'Sri Lanka', flag: '🇱🇰' },
  { code: '+249', name: 'Sudan', flag: '🇸🇩' },
  { code: '+597', name: 'Suriname', flag: '🇸🇷' },
  { code: '+47', name: 'Svalbard and Jan Mayen', flag: '🇸🇯' },
  { code: '+268', name: 'Swaziland', flag: '🇸🇿' },
  { code: '+46', name: 'Sweden', flag: '🇸🇪' },
  { code: '+41', name: 'Switzerland', flag: '🇨🇭' },
  { code: '+963', name: 'Syria', flag: '🇸🇾' },
  { code: '+886', name: 'Taiwan', flag: '🇹🇼' },
  { code: '+992', name: 'Tajikistan', flag: '🇹🇯' },
  { code: '+255', name: 'Tanzania', flag: '🇹🇿' },
  { code: '+66', name: 'Thailand', flag: '🇹🇭' },
  { code: '+228', name: 'Togo', flag: '🇹🇬' },
  { code: '+690', name: 'Tokelau', flag: '🇹🇰' },
  { code: '+676', name: 'Tonga', flag: '🇹🇴' },
  { code: '+1-868', name: 'Trinidad and Tobago', flag: '🇹🇹' },
  { code: '+216', name: 'Tunisia', flag: '🇹🇳' },
  { code: '+90', name: 'Turkey', flag: '🇹🇷' },
  { code: '+993', name: 'Turkmenistan', flag: '🇹🇲' },
  { code: '+1-649', name: 'Turks and Caicos Islands', flag: '🇹🇨' },
  { code: '+688', name: 'Tuvalu', flag: '🇹🇻' },
  { code: '+1-340', name: 'U.S. Virgin Islands', flag: '🇻🇮' },
  { code: '+256', name: 'Uganda', flag: '🇺🇬' },
  { code: '+380', name: 'Ukraine', flag: '🇺🇦' },
  { code: '+971', name: 'United Arab Emirates', flag: '🇦🇪' },
  { code: '+44', name: 'United Kingdom', flag: '🇬🇧' },
  { code: '+1', name: 'United States', flag: '🇺🇸' },
  { code: '+598', name: 'Uruguay', flag: '🇺🇾' },
  { code: '+998', name: 'Uzbekistan', flag: '🇺🇿' },
  { code: '+678', name: 'Vanuatu', flag: '🇻🇺' },
  { code: '+379', name: 'Vatican', flag: '🇻🇦' },
  { code: '+58', name: 'Venezuela', flag: '🇻🇪' },
  { code: '+84', name: 'Vietnam', flag: '🇻🇳' },
  { code: '+681', name: 'Wallis and Futuna', flag: '🇼🇫' },
  { code: '+212', name: 'Western Sahara', flag: '🇪🇭' },
  { code: '+967', name: 'Yemen', flag: '🇾🇪' },
  { code: '+260', name: 'Zambia', flag: '🇿🇲' },
  { code: '+263', name: 'Zimbabwe', flag: '🇿🇼' },
];

export default function Settings() {
  // Current logged-in user state
  const [currentUser, setCurrentUser] = useState<any>(null);
  
  // User state
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [perPage, setPerPage] = useState('10');
  const [searchTerm, setSearchTerm] = useState('');
  const [totalItems, setTotalItems] = useState(0);
  const [selectedBranchFilter, setSelectedBranchFilter] = useState('');
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [changePasswordModalOpen, setChangePasswordModalOpen] = useState(false);
  const [passwordData, setPasswordData] = useState({
    password: '',
    password_confirmation: '',
  });
  const [changingPasswordUser, setChangingPasswordUser] = useState<User | null>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deletingUser, setDeletingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
    role_id: '2',
    status: '1',
    department_id: '',
    designation_id: '',
    branch_id: '',
  });
  const [saving, setSaving] = useState(false);
  const [allBranchesForDropdown, setAllBranchesForDropdown] = useState<any[]>([]);

  // Assign Agents to Manager state
  const [assignAgentsModalOpen, setAssignAgentsModalOpen] = useState(false);
  const [selectedManagerForAgents, setSelectedManagerForAgents] = useState<User | null>(null);
  const [agentUsers, setAgentUsers] = useState<User[]>([]);
  const [selectedAgents, setSelectedAgents] = useState<number[]>([]);
  const [assigningAgents, setAssigningAgents] = useState(false);

  // View Assigned Agents state
  const [viewAssignedAgentsModalOpen, setViewAssignedAgentsModalOpen] = useState(false);
  const [viewingManagerAgents, setViewingManagerAgents] = useState<User | null>(null);
  const [assignedAgentsList, setAssignedAgentsList] = useState<any[]>([]);
  const [loadingAssignedAgents, setLoadingAssignedAgents] = useState(false);
  const [deleteAgentConfirmOpen, setDeleteAgentConfirmOpen] = useState(false);
  const [agentToDelete, setAgentToDelete] = useState<any>(null);

  // Role state
  const [roles, setRoles] = useState<Role[]>([]);
  const [loadingRoles, setLoadingRoles] = useState(true);
  const [errorRoles, setErrorRoles] = useState<string | null>(null);
  const [currentPageRoles, setCurrentPageRoles] = useState(1);
  const [totalPagesRoles, setTotalPagesRoles] = useState(1);
  const [perPageRoles, setPerPageRoles] = useState('10');
  const [searchTermRoles, setSearchTermRoles] = useState('');
  const [totalItemsRoles, setTotalItemsRoles] = useState(0);
  const [editRoleModalOpen, setEditRoleModalOpen] = useState(false);
  const [addRoleModalOpen, setAddRoleModalOpen] = useState(false);
  const [deleteRoleModalOpen, setDeleteRoleModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [deletingRole, setDeletingRole] = useState<Role | null>(null);
  const [roleFormData, setRoleFormData] = useState({
    name: '',
    description: '',
    permissions: [] as string[],
  });

  // Branch state
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loadingBranches, setLoadingBranches] = useState(true);
  const [errorBranches, setErrorBranches] = useState<string | null>(null);
  const [searchTermBranches, setSearchTermBranches] = useState('');
  const [currentPageBranches, setCurrentPageBranches] = useState(1);
  const [totalPagesBranches, setTotalPagesBranches] = useState(1);
  const [perPageBranches, setPerPageBranches] = useState('10');
  const [totalItemsBranches, setTotalItemsBranches] = useState(0);
  const [editBranchModalOpen, setEditBranchModalOpen] = useState(false);
  const [deleteBranchModalOpen, setDeleteBranchModalOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);
  const [deletingBranch, setDeletingBranch] = useState<Branch | null>(null);
  const [branchFormData, setBranchFormData] = useState({
    branch_name: '',
    address: '',
    country_code: '+91',
    customer_care_number: ''
  });
  const [editBranchFormData, setEditBranchFormData] = useState({
    branch_name: '',
    address: '',
    country_code: '+91',
    customer_care_number: ''
  });
  const [savingBranch, setSavingBranch] = useState(false);

  // Brand state
  const [brands, setBrands] = useState<Brand[]>([]);
  const [allBrands, setAllBrands] = useState<Brand[]>([]);
  const [filteredBrands, setFilteredBrands] = useState<Brand[]>([]);
  const [loadingBrands, setLoadingBrands] = useState(false);
  const [errorBrands, setErrorBrands] = useState<string | null>(null);
  const [currentPageBrands, setCurrentPageBrands] = useState(1);
  const [perPageBrands, setPerPageBrands] = useState(10);
  const [searchTermBrands, setSearchTermBrands] = useState('');
  const [newBrandName, setNewBrandName] = useState('');
  const [savingBrand, setSavingBrand] = useState(false);
  const [editBrandModalOpen, setEditBrandModalOpen] = useState(false);
  const [deleteBrandModalOpen, setDeleteBrandModalOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
  const [deletingBrand, setDeletingBrand] = useState<Brand | null>(null);
  const [editBrandName, setEditBrandName] = useState('');

  // Category state
  const [categories, setCategories] = useState<Category[]>([]);
  const [allCategories, setAllCategories] = useState<Category[]>([]);
  const [filteredCategories, setFilteredCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [errorCategories, setErrorCategories] = useState<string | null>(null);
  const [currentPageCategories, setCurrentPageCategories] = useState(1);
  const [perPageCategories, setPerPageCategories] = useState(10);
  const [searchTermCategories, setSearchTermCategories] = useState('');
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryBrandId, setNewCategoryBrandId] = useState('');
  const [savingCategory, setSavingCategory] = useState(false);
  const [editCategoryModalOpen, setEditCategoryModalOpen] = useState(false);
  const [deleteCategoryModalOpen, setDeleteCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deletingCategory, setDeletingCategory] = useState<Category | null>(null);
  const [editCategoryName, setEditCategoryName] = useState('');
  const [editCategoryBrandId, setEditCategoryBrandId] = useState('');

  // Department state
  const [departments, setDepartments] = useState<Department[]>([]);
  const [allDepartments, setAllDepartments] = useState<Department[]>([]);
  const [filteredDepartments, setFilteredDepartments] = useState<Department[]>([]);
  const [loadingDepartments, setLoadingDepartments] = useState(false);
  const [errorDepartments, setErrorDepartments] = useState<string | null>(null);
  const [currentPageDepartments, setCurrentPageDepartments] = useState(1);
  const [perPageDepartments, setPerPageDepartments] = useState(10);
  const [searchTermDepartments, setSearchTermDepartments] = useState('');
  const [newDepartmentName, setNewDepartmentName] = useState('');
  const [savingDepartment, setSavingDepartment] = useState(false);
  const [editDepartmentModalOpen, setEditDepartmentModalOpen] = useState(false);
  const [deleteDepartmentModalOpen, setDeleteDepartmentModalOpen] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null);
  const [deletingDepartment, setDeletingDepartment] = useState<Department | null>(null);
  const [editDepartmentName, setEditDepartmentName] = useState('');

  // Designation state
  const [designations, setDesignations] = useState<Designation[]>([]);
  const [allDesignations, setAllDesignations] = useState<Designation[]>([]);
  const [filteredDesignations, setFilteredDesignations] = useState<Designation[]>([]);
  const [loadingDesignations, setLoadingDesignations] = useState(false);
  const [errorDesignations, setErrorDesignations] = useState<string | null>(null);
  const [currentPageDesignations, setCurrentPageDesignations] = useState(1);
  const [perPageDesignations, setPerPageDesignations] = useState(10);
  const [searchTermDesignations, setSearchTermDesignations] = useState('');
  const [newDesignationName, setNewDesignationName] = useState('');
  const [savingDesignation, setSavingDesignation] = useState(false);
  const [editDesignationModalOpen, setEditDesignationModalOpen] = useState(false);
  const [deleteDesignationModalOpen, setDeleteDesignationModalOpen] = useState(false);
  const [editingDesignation, setEditingDesignation] = useState<Designation | null>(null);
  const [deletingDesignation, setDeletingDesignation] = useState<Designation | null>(null);
  const [editDesignationName, setEditDesignationName] = useState('');

  // Ticket Labels state
  const [ticketLabels, setTicketLabels] = useState<TicketLabel[]>([]);
  const [allTicketLabels, setAllTicketLabels] = useState<TicketLabel[]>([]);
  const [filteredTicketLabels, setFilteredTicketLabels] = useState<TicketLabel[]>([]);
  const [loadingTicketLabels, setLoadingTicketLabels] = useState(false);
  const [errorTicketLabels, setErrorTicketLabels] = useState<string | null>(null);
  const [currentPageTicketLabels, setCurrentPageTicketLabels] = useState(1);
  const [perPageTicketLabels, setPerPageTicketLabels] = useState(10);
  const [searchTermTicketLabels, setSearchTermTicketLabels] = useState('');
  const [newTicketLabelName, setNewTicketLabelName] = useState('');
  const [newTicketLabelColor, setNewTicketLabelColor] = useState('#3B82F6');
  const [savingTicketLabel, setSavingTicketLabel] = useState(false);
  const [editTicketLabelModalOpen, setEditTicketLabelModalOpen] = useState(false);
  const [deleteTicketLabelModalOpen, setDeleteTicketLabelModalOpen] = useState(false);
  const [editingTicketLabel, setEditingTicketLabel] = useState<TicketLabel | null>(null);
  const [deletingTicketLabel, setDeletingTicketLabel] = useState<TicketLabel | null>(null);
  const [editTicketLabelName, setEditTicketLabelName] = useState('');
  const [editTicketLabelColor, setEditTicketLabelColor] = useState('#3B82F6');
  
  // Additional Fields state
  const [additionalFields, setAdditionalFields] = useState<AdditionalField[]>([]);
  const [allAdditionalFields, setAllAdditionalFields] = useState<AdditionalField[]>([]);
  const [filteredAdditionalFields, setFilteredAdditionalFields] = useState<AdditionalField[]>([]);
  const [loadingAdditionalFields, setLoadingAdditionalFields] = useState(false);
  const [errorAdditionalFields, setErrorAdditionalFields] = useState<string | null>(null);
  const [currentPageAdditionalFields, setCurrentPageAdditionalFields] = useState(1);
  const [perPageAdditionalFields, setPerPageAdditionalFields] = useState(10);
  const [searchTermAdditionalFields, setSearchTermAdditionalFields] = useState('');
  const [newFieldTitle, setNewFieldTitle] = useState('');
  const [newFieldName, setNewFieldName] = useState('');
  const [newFieldType, setNewFieldType] = useState('1');
  const [newFieldMandatory, setNewFieldMandatory] = useState(false);
  const [newFieldShowFilter, setNewFieldShowFilter] = useState(false);
  const [newFieldShowList, setNewFieldShowList] = useState(false);
  const [newFieldMultiselect, setNewFieldMultiselect] = useState(false);
  const [newFieldValues, setNewFieldValues] = useState<string[]>(['']);
  const [savingAdditionalField, setSavingAdditionalField] = useState(false);
  const [editAdditionalFieldModalOpen, setEditAdditionalFieldModalOpen] = useState(false);
  const [deleteAdditionalFieldModalOpen, setDeleteAdditionalFieldModalOpen] = useState(false);
  const [editingAdditionalField, setEditingAdditionalField] = useState<AdditionalField | null>(null);
  const [deletingAdditionalField, setDeletingAdditionalField] = useState<AdditionalField | null>(null);
  const [editFieldTitle, setEditFieldTitle] = useState('');
  const [editFieldName, setEditFieldName] = useState('');
  const [editFieldType, setEditFieldType] = useState('1');
  const [editFieldMandatory, setEditFieldMandatory] = useState(false);
  const [editFieldShowFilter, setEditFieldShowFilter] = useState(false);
  const [editFieldShowList, setEditFieldShowList] = useState(false);
  const [editFieldMultiselect, setEditFieldMultiselect] = useState(false);
  const [editFieldValues, setEditFieldValues] = useState<string[]>(['']);

  // QR Code state
  const [qrcodes, setQrcodes] = useState<QRCodeItem[]>([]);
  const [loadingQRCodes, setLoadingQRCodes] = useState(false);
  const [generatingQRCode, setGeneratingQRCode] = useState(false);
  const [qrcodeLink, setQrcodeLink] = useState(`${window.location.origin}/register`);
  const [selectedQRBranch, setSelectedQRBranch] = useState<string>('');
  const [deletingQRCode, setDeletingQRCode] = useState<QRCodeItem | null>(null);
  const [deleteQRCodeModalOpen, setDeleteQRCodeModalOpen] = useState(false);

  // Message Settings state
  const [messageSettings, setMessageSettings] = useState<MessageSetting[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [messageModalOpen, setMessageModalOpen] = useState(false);
  const [deleteMessageModalOpen, setDeleteMessageModalOpen] = useState(false);
  const [viewMessageModalOpen, setViewMessageModalOpen] = useState(false);
  const [editingMessage, setEditingMessage] = useState<MessageSetting | null>(null);
  const [deletingMessage, setDeletingMessage] = useState<MessageSetting | null>(null);
  const [viewingMessage, setViewingMessage] = useState<MessageSetting | null>(null);
  const [searchTermMessages, setSearchTermMessages] = useState('');
  const [messageTypeFilter, setMessageTypeFilter] = useState<string>('all');
  const [currentPageMessages, setCurrentPageMessages] = useState(1);
  const [totalPagesMessages, setTotalPagesMessages] = useState(1);
  const [perPageMessages, setPerPageMessages] = useState(10);
  const [showSecrets, setShowSecrets] = useState<{ [key: number]: boolean }>({});
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [messageFormData, setMessageFormData] = useState({
    vendor_name: '',
    whatsapp_api: '',
    api_token: '',
    phone_number_id: '',
    status: true,
  });

  // SMS Settings state
  const [smsSettings, setSmsSettings] = useState<SmsSetting[]>([]);
  const [loadingSms, setLoadingSms] = useState(false);
  const [smsModalOpen, setSmsModalOpen] = useState(false);
  const [deleteSmsModalOpen, setDeleteSmsModalOpen] = useState(false);
  const [editingSms, setEditingSms] = useState<SmsSetting | null>(null);
  const [deletingSms, setDeletingSms] = useState<SmsSetting | null>(null);
  const [searchTermSms, setSearchTermSms] = useState('');
  const [currentPageSms, setCurrentPageSms] = useState(1);
  const [totalPagesSms, setTotalPagesSms] = useState(1);
  const [perPageSms, setPerPageSms] = useState(10);
  const [smsFormData, setSmsFormData] = useState({
    vendor_name: '',
    sms_api: '',
    api_token: '',
    sender_id: '',
    status: true,
  });

  // Telegram Notification Settings state
  const [telegramSettings, setTelegramSettings] = useState<TelegramNotificationSetting[]>([]);
  const [loadingTelegramSettings, setLoadingTelegramSettings] = useState(false);
  const [togglingTelegramSetting, setTogglingTelegramSetting] = useState<number | null>(null);
  const [telegramCredentialsAlertOpen, setTelegramCredentialsAlertOpen] = useState(false);

  // Company Logo state
  const [companyLogos, setCompanyLogos] = useState<CompanyLogo[]>([]);
  const [loadingLogos, setLoadingLogos] = useState(false);
  const [errorLogos, setErrorLogos] = useState<string | null>(null);
  const [currentPageLogos, setCurrentPageLogos] = useState(1);
  const [perPageLogos, setPerPageLogos] = useState(10);
  const [searchTermLogos, setSearchTermLogos] = useState('');
  const [totalPagesLogos, setTotalPagesLogos] = useState(1);
  const [totalLogos, setTotalLogos] = useState(0);
  const [savingLogo, setSavingLogo] = useState(false);
  const [logoFormData, setLogoFormData] = useState({
    name: '',
    type: 'Logo' as 'Logo' | 'Favicon',
    logo_image: null as File | null,
    is_active: true
  });
  const [editLogoModalOpen, setEditLogoModalOpen] = useState(false);
  
  const [deleteLogoModalOpen, setDeleteLogoModalOpen] = useState(false);
  const [editingLogo, setEditingLogo] = useState<CompanyLogo | null>(null);
  const [deletingLogo, setDeletingLogo] = useState<CompanyLogo | null>(null);

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      fetchUsers();
    }, 300);
    
    return () => clearTimeout(debounceTimer);
  }, [currentPage, perPage, searchTerm, selectedBranchFilter]);

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      fetchRoles();
    }, 300);
    
    return () => clearTimeout(debounceTimer);
  }, [currentPageRoles, perPageRoles, searchTermRoles]);

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      fetchBranches();
    }, 300);
    
    return () => clearTimeout(debounceTimer);
  }, [currentPageBranches, perPageBranches, searchTermBranches]);

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      fetchCompanyLogos();
    }, 300);
    
    return () => clearTimeout(debounceTimer);
  }, [currentPageLogos, perPageLogos, searchTermLogos]);

  useEffect(() => {
    fetchCurrentUser();
    fetchAllBranchesForDropdown();
    fetchBrands();
    fetchCategories();
    fetchDepartments();
    fetchDesignations();
    fetchTicketLabels();
    fetchAdditionalFields();
    fetchQRCodes();
  }, []);

  // Update link when branch is selected
  useEffect(() => {
    if (selectedQRBranch) {
      setQrcodeLink(`${window.location.origin}/register?branch_id=${selectedQRBranch}`);
    } else {
      setQrcodeLink(`${window.location.origin}/register`);
    }
  }, [selectedQRBranch]);

  useEffect(() => {
    // Filter brands based on search term
    if (searchTermBrands) {
      const filtered = allBrands.filter(brand => 
        brand.brand.toLowerCase().includes(searchTermBrands.toLowerCase())
      );
      setFilteredBrands(filtered);
    } else {
      setFilteredBrands(allBrands);
    }
    setCurrentPageBrands(1); // Reset to first page when search changes
  }, [searchTermBrands, allBrands]);

  useEffect(() => {
    // Filter categories based on search term
    if (searchTermCategories) {
      const filtered = allCategories.filter(category => 
        category.category.toLowerCase().includes(searchTermCategories.toLowerCase()) ||
        category.brand?.brand.toLowerCase().includes(searchTermCategories.toLowerCase())
      );
      setFilteredCategories(filtered);
    } else {
      setFilteredCategories(allCategories);
    }
    setCurrentPageCategories(1); // Reset to first page when search changes
  }, [searchTermCategories, allCategories]);

  useEffect(() => {
    // Filter departments based on search term
    if (searchTermDepartments) {
      const filtered = allDepartments.filter(department => 
        department.department_name.toLowerCase().includes(searchTermDepartments.toLowerCase())
      );
      setFilteredDepartments(filtered);
    } else {
      setFilteredDepartments(allDepartments);
    }
    setCurrentPageDepartments(1); // Reset to first page when search changes
  }, [searchTermDepartments, allDepartments]);

  useEffect(() => {
    // Filter designations based on search term
    if (searchTermDesignations) {
      const filtered = allDesignations.filter(designation => 
        designation.designation_name.toLowerCase().includes(searchTermDesignations.toLowerCase())
      );
      setFilteredDesignations(filtered);
    } else {
      setFilteredDesignations(allDesignations);
    }
    setCurrentPageDesignations(1); // Reset to first page when search changes
  }, [searchTermDesignations, allDesignations]);

  const fetchCurrentUser = async () => {
    try {
      const response = await fetch('/api/user', {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setCurrentUser(data.user);
      }
    } catch (err) {
      console.error('Error fetching current user:', err);
    }
  };

  const fetchAllBranchesForDropdown = async () => {
    try {
      const response = await axios.get('/branches-management', {
        params: {
          per_page: 100,
        },
      });
      setAllBranchesForDropdown(response.data.data || []);
    } catch (err) {
      console.error('Error fetching branches for dropdown:', err);
    }
  };

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        per_page: perPage,
        search: searchTerm,
      });
      
      // Add branch filter if selected
      if (selectedBranchFilter) {
        params.append('branch_id', selectedBranchFilter);
      }
      
      const response = await fetch(`/api/users?${params}`, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }

      const data = await response.json();
      setUsers(data.data || []);
      setTotalPages(data.last_page || 1);
      setTotalItems(data.total || 0);
      setCurrentPage(data.current_page || 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const getRoleName = (role: number) => {
    switch (role) {
      case 1: return 'Admin';
      case 2: return 'Agent';
      case 3: return 'Manager';
      case 4: return 'Branch Admin';
      default: return 'Unknown';
    }
  };

  const getStatusName = (status: number) => {
    return status === 1 ? 'Active' : 'Inactive';
  };

  const handleAdd = () => {
    setIsEditMode(false);
    setEditingUser(null);
    // Set default role based on current user's role
    const defaultRoleId = currentUser?.role_id === 4 ? '2' : '2'; // Default to Agent
    setFormData({
      name: '',
      email: '',
      password: '',
      password_confirmation: '',
      role_id: defaultRoleId,
      status: '1',
      department_id: '',
      designation_id: '',
      branch_id: currentUser?.role_id === 1 ? '' : (currentUser?.branch_id?.toString() || ''),
    });
    setUserModalOpen(true);
  };

  const handleEdit = (user: User) => {
    setIsEditMode(true);
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      password: '',
      password_confirmation: '',
      role_id: (user.role_id || user.role || 2).toString(),
      status: user.status.toString(),
      department_id: user.department_id?.toString() || '',
      designation_id: user.designation_id?.toString() || '',
    });
    setUserModalOpen(true);
  };

  const handleDelete = (user: User) => {
    setDeletingUser(user);
    setDeleteModalOpen(true);
  };

  const handleChangePassword = (user: User) => {
    setChangingPasswordUser(user);
    setPasswordData({
      password: '',
      password_confirmation: '',
    });
    setChangePasswordModalOpen(true);
  };

  const handleSavePassword = async () => {
    if (!changingPasswordUser) return;

    // Validation
    if (!passwordData.password) {
      toast.error('Password is required');
      return;
    }
    if (passwordData.password.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }
    if (passwordData.password !== passwordData.password_confirmation) {
      toast.error('Passwords do not match');
      return;
    }

    setSaving(true);
    try {
      const response = await fetch(`/api/users/${changingPasswordUser.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
        body: JSON.stringify({
          password: passwordData.password,
          password_confirmation: passwordData.password_confirmation,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.errors) {
          const firstError = Object.values(data.errors)[0];
          toast.error(Array.isArray(firstError) ? firstError[0] : firstError);
        } else if (data.message) {
          toast.error(data.message);
        } else {
          toast.error('Failed to change password');
        }
        return;
      }

      toast.success('Password changed successfully');
      setChangePasswordModalOpen(false);
      setChangingPasswordUser(null);
      setPasswordData({
        password: '',
        password_confirmation: '',
      });
    } catch (err) {
      console.error('Error changing password:', err);
      toast.error('Failed to change password. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  // Handle assign agents to manager
  const handleAssignAgents = async (user: User) => {
    setSelectedManagerForAgents(user);
    setSelectedAgents([]);

    // Fetch agent users (role_id = 2)
    try {
      const response = await fetch('/api/agent-users', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setAgentUsers(data);
      } else {
        toast.error('Failed to fetch agents');
      }
    } catch (err) {
      console.error('Error fetching agents:', err);
      toast.error('Failed to fetch agents');
    }

    setAssignAgentsModalOpen(true);
  };

  const handleSaveAssignedAgents = async () => {
    if (!selectedManagerForAgents || selectedAgents.length === 0) {
      toast.error('Please select at least one agent');
      return;
    }

    setAssigningAgents(true);
    try {
      const response = await fetch('/api/users/assign-agents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
        body: JSON.stringify({
          manager_id: selectedManagerForAgents.id,
          agent_ids: selectedAgents,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.message || 'Failed to assign agents');
        return;
      }

      toast.success('Agents assigned successfully');
      setAssignAgentsModalOpen(false);
      setSelectedManagerForAgents(null);
      setSelectedAgents([]);

      // Refresh the users list to update the count
      fetchUsers();
    } catch (err) {
      console.error('Error assigning agents:', err);
      toast.error('Failed to assign agents. Please try again.');
    } finally {
      setAssigningAgents(false);
    }
  };

  // Handle view assigned agents
  const handleViewAssignedAgents = async (user: User) => {
    setViewingManagerAgents(user);
    setLoadingAssignedAgents(true);
    setViewAssignedAgentsModalOpen(true);

    try {
      const response = await fetch(`/api/users/${user.id}/assigned-agents`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setAssignedAgentsList(data);
      } else {
        toast.error('Failed to fetch assigned agents');
      }
    } catch (err) {
      console.error('Error fetching assigned agents:', err);
      toast.error('Failed to fetch assigned agents');
    } finally {
      setLoadingAssignedAgents(false);
    }
  };

  // Handle remove agent assignment - show confirmation
  const handleRemoveAgentClick = (agent: any) => {
    setAgentToDelete(agent);
    setDeleteAgentConfirmOpen(true);
  };

  // Confirm and remove agent assignment
  const confirmRemoveAgent = async () => {
    if (!viewingManagerAgents || !agentToDelete) return;

    try {
      const response = await fetch(`/api/users/${viewingManagerAgents.id}/remove-agent/${agentToDelete.agent_id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.message || 'Failed to remove agent');
        return;
      }

      toast.success('Agent removed successfully');

      // Refresh assigned agents list
      setAssignedAgentsList(assignedAgentsList.filter(agent => agent.agent_id !== agentToDelete.agent_id));

      // Refresh users list to update count
      fetchUsers();

      // Close confirmation dialog
      setDeleteAgentConfirmOpen(false);
      setAgentToDelete(null);
    } catch (err) {
      console.error('Error removing agent:', err);
      toast.error('Failed to remove agent. Please try again.');
    }
  };

  const handleSaveUser = async () => {
    if (isEditMode) {
      await handleSaveEdit();
    } else {
      await handleSaveAdd();
    }
  };

  const handleSaveAdd = async () => {
    // Validation
    if (!formData.name.trim()) {
      toast.error('Name is required');
      return;
    }
    if (!formData.email.trim()) {
      toast.error('Email is required');
      return;
    }
    if (!formData.password) {
      toast.error('Password is required');
      return;
    }
    if (formData.password.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }
    if (formData.password !== formData.password_confirmation) {
      toast.error('Passwords do not match');
      return;
    }
    if (!formData.department_id) {
      toast.error('Department is required');
      return;
    }
    if (!formData.designation_id) {
      toast.error('Designation is required');
      return;
    }

    setSaving(true);
    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.trim(),
          password: formData.password,
          password_confirmation: formData.password_confirmation,
          role_id: parseInt(formData.role_id),
          status: parseInt(formData.status),
          department_id: formData.department_id ? parseInt(formData.department_id) : null,
          designation_id: formData.designation_id ? parseInt(formData.designation_id) : null,
          branch_id: formData.branch_id ? parseInt(formData.branch_id) : null,
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        if (data.errors) {
          const firstError = Object.values(data.errors)[0];
          toast.error(Array.isArray(firstError) ? firstError[0] : firstError);
        } else if (data.message) {
          toast.error(data.message);
        } else {
          toast.error('Failed to create user');
        }
        return;
      }

      toast.success('User created successfully');
      await fetchUsers();
      setUserModalOpen(false);
      
      // Reset form
      setFormData({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        role_id: '2',
        status: '1',
        department_id: '',
        designation_id: '',
      });
    } catch (err) {
      console.error('Error creating user:', err);
      toast.error('Failed to create user. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveEdit = async () => {
    if (!editingUser) return;
    
    setSaving(true);
    try {
      const updateData: any = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        role_id: parseInt(formData.role_id),
        status: parseInt(formData.status),
        department_id: formData.department_id ? parseInt(formData.department_id) : null,
        designation_id: formData.designation_id ? parseInt(formData.designation_id) : null,
      };

      if (formData.password) {
        updateData.password = formData.password;
        updateData.password_confirmation = formData.password_confirmation;
      }

      const response = await fetch(`/api/users/${editingUser.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
        body: JSON.stringify(updateData),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.errors) {
          const firstError = Object.values(data.errors)[0];
          toast.error(Array.isArray(firstError) ? firstError[0] : firstError);
        } else if (data.message) {
          toast.error(data.message);
        } else {
          toast.error('Failed to update user');
        }
        setSaving(false);
        return;
      }

      toast.success('User updated successfully');
      await fetchUsers();
      setUserModalOpen(false);
    } catch (err) {
      console.error('Error updating user:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingUser) return;
    
    setSaving(true);
    try {
      const response = await fetch(`/api/users/${deletingUser.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete user');
      }

      await fetchUsers();
      setDeleteModalOpen(false);
    } catch (err) {
      console.error('Error deleting user:', err);
    } finally {
      setSaving(false);
    }
  };

  // Role functions
  const fetchRoles = async () => {
    setLoadingRoles(true);
    setErrorRoles(null);
    
    try {
      const response = await axios.get('/roles', {
        params: {
          page: currentPageRoles.toString(),
          per_page: perPageRoles,
          search: searchTermRoles,
        },
      });

      setRoles(response.data.data || []);
      setTotalPagesRoles(response.data.last_page || 1);
      setTotalItemsRoles(response.data.total || 0);
      setCurrentPageRoles(response.data.current_page || 1);
    } catch (err) {
      setErrorRoles(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoadingRoles(false);
    }
  };

  const handleAddRole = () => {
    setRoleFormData({
      name: '',
      description: '',
      permissions: [],
    });
    setAddRoleModalOpen(true);
  };

  const handleEditRole = (role: Role) => {
    setEditingRole(role);
    setRoleFormData({
      name: role.name,
      description: role.description || '',
      permissions: role.permissions || [],
    });
    setEditRoleModalOpen(true);
  };

  const handleDeleteRole = (role: Role) => {
    setDeletingRole(role);
    setDeleteRoleModalOpen(true);
  };

  const handleSaveAddRole = async () => {
    setSaving(true);
    try {
      const response = await axios.post('/roles', roleFormData);
      
      if (response.data) {
        await fetchRoles();
        // Reset form
        setRoleFormData({
          name: '',
          description: '',
          permissions: [],
        });
        setAddRoleModalOpen(false);
        toast.success('Role created successfully!');
      }
    } catch (error: any) {
      console.error('Error creating role:', error);
      if (error.response?.data?.message) {
        toast.error(`Error: ${error.response.data.message}`);
      } else {
        toast.error('Failed to create role. Please try again.');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleSaveEditRole = async () => {
    if (!editingRole) return;
    
    setSaving(true);
    try {
      const response = await axios.put(`/roles/${editingRole.id}`, roleFormData);
      
      if (response.data) {
        await fetchRoles();
        setEditRoleModalOpen(false);
        toast.success('Role updated successfully!');
      }
    } catch (error: any) {
      console.error('Error updating role:', error);
      if (error.response?.data?.message) {
        toast.error(`Error: ${error.response.data.message}`);
      } else {
        toast.error('Failed to update role. Please try again.');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleConfirmDeleteRole = async () => {
    if (!deletingRole) return;
    
    setSaving(true);
    try {
      const response = await axios.delete(`/roles/${deletingRole.id}`);
      
      if (response.data) {
        await fetchRoles();
        setDeleteRoleModalOpen(false);
        setDeletingRole(null);
        toast.success('Role deleted successfully!');
      }
    } catch (error: any) {
      console.error('Error deleting role:', error);
      if (error.response?.data?.message) {
        toast.error(`Error: ${error.response.data.message}`);
      } else {
        toast.error('Failed to delete role. Please try again.');
      }
    } finally {
      setSaving(false);
    }
  };

  // Branch functions
  const fetchBranches = async () => {
    setLoadingBranches(true);
    setErrorBranches(null);
    
    try {
      const response = await axios.get('/branches-management', {
        params: {
          page: currentPageBranches.toString(),
          per_page: perPageBranches,
          search: searchTermBranches,
        },
      });
      setBranches(response.data.data || []);
      setTotalPagesBranches(response.data.last_page || 1);
      setTotalItemsBranches(response.data.total || 0);
      setCurrentPageBranches(response.data.current_page || 1);
    } catch (err) {
      setErrorBranches(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoadingBranches(false);
    }
  };

  const handleAddBranch = async () => {
    if (!branchFormData.branch_name.trim()) {
      toast.error('Branch name is required');
      return;
    }

    setSavingBranch(true);
    try {
      const response = await axios.post('/branches-management', {
        branch_name: branchFormData.branch_name.trim(),
        address: branchFormData.address.trim(),
        country_code: branchFormData.country_code,
        customer_care_number: branchFormData.customer_care_number.trim(),
      });
      
      if (response.data) {
        await fetchBranches();
        setBranchFormData({
          branch_name: '',
          address: '',
          country_code: '+91',
          customer_care_number: ''
        });
        toast.success('Branch created successfully!');
      }
    } catch (error: any) {
      console.error('Error creating branch:', error);
      if (error.response?.data?.message) {
        toast.error(`Error: ${error.response.data.message}`);
      } else {
        toast.error('Failed to create branch. Please try again.');
      }
    } finally {
      setSavingBranch(false);
    }
  };

  const handleEditBranch = (branch: Branch) => {
    setEditingBranch(branch);
    setEditBranchFormData({
      branch_name: branch.branch_name,
      address: branch.address || '',
      country_code: branch.country_code || '+91',
      customer_care_number: branch.customer_care_number || ''
    });
    setEditBranchModalOpen(true);
  };

  const handleUpdateBranch = async () => {
    if (!editingBranch) return;
    
    if (!editBranchFormData.branch_name.trim()) {
      toast.error('Branch name is required');
      return;
    }

    setSavingBranch(true);
    try {
      const response = await axios.put(`/branches-management/${editingBranch.id}`, {
        branch_name: editBranchFormData.branch_name.trim(),
        address: editBranchFormData.address.trim(),
        country_code: editBranchFormData.country_code,
        customer_care_number: editBranchFormData.customer_care_number.trim(),
      });
      
      if (response.data) {
        await fetchBranches();
        setEditBranchModalOpen(false);
        setEditingBranch(null);
        setEditBranchFormData({
          branch_name: '',
          address: '',
          country_code: '+91',
          customer_care_number: ''
        });
        toast.success('Branch updated successfully!');
      }
    } catch (error: any) {
      console.error('Error updating branch:', error);
      if (error.response?.data?.message) {
        toast.error(`Error: ${error.response.data.message}`);
      } else {
        toast.error('Failed to update branch. Please try again.');
      }
    } finally {
      setSavingBranch(false);
    }
  };

  const handleDeleteBranch = (branch: Branch) => {
    setDeletingBranch(branch);
    setDeleteBranchModalOpen(true);
  };

  const confirmDeleteBranch = async () => {
    if (!deletingBranch) return;

    setSavingBranch(true);
    try {
      const response = await axios.delete(`/branches-management/${deletingBranch.id}`);
      
      if (response.data) {
        await fetchBranches();
        setDeleteBranchModalOpen(false);
        setDeletingBranch(null);
        toast.success('Branch deleted successfully!');
      }
    } catch (error: any) {
      console.error('Error deleting branch:', error);
      if (error.response?.data?.message) {
        toast.error(`Error: ${error.response.data.message}`);
      } else {
        toast.error('Failed to delete branch. Please try again.');
      }
    } finally {
      setSavingBranch(false);
    }
  };

  // Brand functions
  const fetchBrands = async () => {
    setLoadingBrands(true);
    setErrorBrands(null);
    
    try {
      const response = await axios.get('/brands');
      setAllBrands(response.data);
      setFilteredBrands(response.data);
    } catch (error: any) {
      console.error('Error fetching brands:', error);
      setErrorBrands(error.response?.data?.message || error.message || 'Failed to fetch brands');
    } finally {
      setLoadingBrands(false);
    }
  };

  const handlePerPageChangeBrands = (value: string) => {
    setPerPageBrands(parseInt(value));
    setCurrentPageBrands(1);
  };

  const handleSearchChangeBrands = (value: string) => {
    setSearchTermBrands(value);
  };

  const handleAddBrand = async () => {
    if (!newBrandName.trim()) return;
    
    setSavingBrand(true);
    try {
      const response = await axios.post('/brands', {
        brand: newBrandName.trim()
      });
      
      if (response.data) {
        // Refresh brands list
        await fetchBrands();
        // Clear the input
        setNewBrandName('');
        toast.success('Brand added successfully!');
      }
    } catch (error: any) {
      console.error('Error adding brand:', error);
      if (error.response?.data?.message) {
        toast.error(`Error: ${error.response.data.message}`);
      } else {
        toast.error('Failed to add brand. Please try again.');
      }
    } finally {
      setSavingBrand(false);
    }
  };

  const handleEditBrand = (brand: Brand) => {
    setEditingBrand(brand);
    setEditBrandName(brand.brand);
    setEditBrandModalOpen(true);
  };

  const handleUpdateBrand = async () => {
    if (!editingBrand || !editBrandName.trim()) return;
    
    setSavingBrand(true);
    try {
      const response = await axios.put(`/brands/${editingBrand.id}`, {
        brand: editBrandName.trim()
      });
      
      if (response.data) {
        // Refresh brands list
        await fetchBrands();
        // Close modal and reset
        setEditBrandModalOpen(false);
        setEditingBrand(null);
        setEditBrandName('');
        toast.success('Brand updated successfully!');
      }
    } catch (error: any) {
      console.error('Error updating brand:', error);
      if (error.response?.data?.message) {
        toast.error(`Error: ${error.response.data.message}`);
      } else {
        toast.error('Failed to update brand. Please try again.');
      }
    } finally {
      setSavingBrand(false);
    }
  };

  const handleDeleteBrand = (brand: Brand) => {
    setDeletingBrand(brand);
    setDeleteBrandModalOpen(true);
  };

  const confirmDeleteBrand = async () => {
    if (!deletingBrand) return;

    setSavingBrand(true);
    try {
      const response = await axios.delete(`/brands/${deletingBrand.id}`);
      
      if (response.data) {
        // Refresh brands list
        await fetchBrands();
        // Close modal and reset
        setDeleteBrandModalOpen(false);
        setDeletingBrand(null);
        toast.success('Brand deleted successfully!');
      }
    } catch (error: any) {
      console.error('Error deleting brand:', error);
      if (error.response?.data?.message) {
        toast.error(`Error: ${error.response.data.message}`);
      } else {
        toast.error('Failed to delete brand. Please try again.');
      }
    } finally {
      setSavingBrand(false);
    }
  };

  // Category functions
  const fetchCategories = async () => {
    setLoadingCategories(true);
    setErrorCategories(null);
    
    try {
      const response = await axios.get('/categories');
      setAllCategories(response.data);
      setFilteredCategories(response.data);
    } catch (error: any) {
      console.error('Error fetching categories:', error);
      setErrorCategories(error.response?.data?.message || error.message || 'Failed to fetch categories');
    } finally {
      setLoadingCategories(false);
    }
  };

  const handlePerPageChangeCategories = (value: string) => {
    setPerPageCategories(parseInt(value));
    setCurrentPageCategories(1);
  };

  const handleSearchChangeCategories = (value: string) => {
    setSearchTermCategories(value);
  };

  const handleAddCategory = async () => {
    if (!newCategoryName.trim() || !newCategoryBrandId) return;
    
    setSavingCategory(true);
    try {
      const response = await axios.post('/categories', {
        category: newCategoryName.trim(),
        brand_id: parseInt(newCategoryBrandId)
      });
      
      if (response.data) {
        // Refresh categories list
        await fetchCategories();
        // Clear the inputs
        setNewCategoryName('');
        setNewCategoryBrandId('');
        toast.success('Category added successfully!');
      }
    } catch (error: any) {
      console.error('Error adding category:', error);
      if (error.response?.data?.message) {
        toast.error(`Error: ${error.response.data.message}`);
      } else {
        toast.error('Failed to add category. Please try again.');
      }
    } finally {
      setSavingCategory(false);
    }
  };

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
    setEditCategoryName(category.category);
    setEditCategoryBrandId(category.brand_id.toString());
    setEditCategoryModalOpen(true);
  };

  const handleUpdateCategory = async () => {
    if (!editingCategory || !editCategoryName.trim() || !editCategoryBrandId) return;
    
    setSavingCategory(true);
    try {
      const response = await axios.put(`/categories/${editingCategory.id}`, {
        category: editCategoryName.trim(),
        brand_id: parseInt(editCategoryBrandId)
      });
      
      if (response.data) {
        // Refresh categories list
        await fetchCategories();
        // Close modal and reset
        setEditCategoryModalOpen(false);
        setEditingCategory(null);
        setEditCategoryName('');
        setEditCategoryBrandId('');
        toast.success('Category updated successfully!');
      }
    } catch (error: any) {
      console.error('Error updating category:', error);
      if (error.response?.data?.message) {
        toast.error(`Error: ${error.response.data.message}`);
      } else {
        toast.error('Failed to update category. Please try again.');
      }
    } finally {
      setSavingCategory(false);
    }
  };

  const handleDeleteCategory = (category: Category) => {
    setDeletingCategory(category);
    setDeleteCategoryModalOpen(true);
  };

  // Department functions
  const fetchDepartments = async () => {
    setLoadingDepartments(true);
    setErrorDepartments(null);
    
    try {
      const response = await axios.get('/departments');
      setAllDepartments(response.data);
      setFilteredDepartments(response.data);
    } catch (error: any) {
      console.error('Error fetching departments:', error);
      setErrorDepartments(error.response?.data?.message || error.message || 'Failed to fetch departments');
    } finally {
      setLoadingDepartments(false);
    }
  };

  const handlePerPageChangeDepartments = (value: string) => {
    setPerPageDepartments(parseInt(value));
    setCurrentPageDepartments(1);
  };

  const handleSearchChangeDepartments = (value: string) => {
    setSearchTermDepartments(value);
  };

  const handleAddDepartment = async () => {
    if (!newDepartmentName.trim()) return;
    
    setSavingDepartment(true);
    try {
      const response = await axios.post('/departments', {
        department_name: newDepartmentName.trim()
      });
      
      if (response.data) {
        // Refresh departments list
        await fetchDepartments();
        // Clear the input
        setNewDepartmentName('');
        toast.success('Department added successfully!');
      }
    } catch (error: any) {
      console.error('Error adding department:', error);
      if (error.response?.data?.message) {
        toast.error(`Error: ${error.response.data.message}`);
      } else {
        toast.error('Failed to add department. Please try again.');
      }
    } finally {
      setSavingDepartment(false);
    }
  };

  const handleEditDepartment = (department: Department) => {
    setEditingDepartment(department);
    setEditDepartmentName(department.department_name);
    setEditDepartmentModalOpen(true);
  };

  const handleUpdateDepartment = async () => {
    if (!editingDepartment || !editDepartmentName.trim()) return;
    
    setSavingDepartment(true);
    try {
      const response = await axios.put(`/departments/${editingDepartment.id}`, {
        department_name: editDepartmentName.trim()
      });
      
      if (response.data) {
        // Refresh departments list
        await fetchDepartments();
        // Close modal and reset
        setEditDepartmentModalOpen(false);
        setEditingDepartment(null);
        setEditDepartmentName('');
        toast.success('Department updated successfully!');
      }
    } catch (error: any) {
      console.error('Error updating department:', error);
      if (error.response?.data?.message) {
        toast.error(`Error: ${error.response.data.message}`);
      } else {
        toast.error('Failed to update department. Please try again.');
      }
    } finally {
      setSavingDepartment(false);
    }
  };

  const handleDeleteDepartment = (department: Department) => {
    setDeletingDepartment(department);
    setDeleteDepartmentModalOpen(true);
  };

  // Designation functions
  const fetchDesignations = async () => {
    setLoadingDesignations(true);
    setErrorDesignations(null);
    
    try {
      const response = await axios.get('/designations');
      setAllDesignations(response.data);
      setFilteredDesignations(response.data);
    } catch (error: any) {
      console.error('Error fetching designations:', error);
      setErrorDesignations(error.response?.data?.message || error.message || 'Failed to fetch designations');
    } finally {
      setLoadingDesignations(false);
    }
  };

  const handlePerPageChangeDesignations = (value: string) => {
    setPerPageDesignations(parseInt(value));
    setCurrentPageDesignations(1);
  };

  const handleSearchChangeDesignations = (value: string) => {
    setSearchTermDesignations(value);
  };

  const handleAddDesignation = async () => {
    if (!newDesignationName.trim()) return;
    
    setSavingDesignation(true);
    try {
      const response = await axios.post('/designations', {
        designation_name: newDesignationName.trim()
      });
      
      if (response.data) {
        // Refresh designations list
        await fetchDesignations();
        // Clear the input
        setNewDesignationName('');
        toast.success('Designation added successfully!');
      }
    } catch (error: any) {
      console.error('Error adding designation:', error);
      if (error.response?.data?.message) {
        toast.error(`Error: ${error.response.data.message}`);
      } else {
        toast.error('Failed to add designation. Please try again.');
      }
    } finally {
      setSavingDesignation(false);
    }
  };

  const handleEditDesignation = (designation: Designation) => {
    setEditingDesignation(designation);
    setEditDesignationName(designation.designation_name);
    setEditDesignationModalOpen(true);
  };

  const handleUpdateDesignation = async () => {
    if (!editingDesignation || !editDesignationName.trim()) return;
    
    setSavingDesignation(true);
    try {
      const response = await axios.put(`/designations/${editingDesignation.id}`, {
        designation_name: editDesignationName.trim()
      });
      
      if (response.data) {
        // Refresh designations list
        await fetchDesignations();
        // Close modal and reset
        setEditDesignationModalOpen(false);
        setEditingDesignation(null);
        setEditDesignationName('');
        toast.success('Designation updated successfully!');
      }
    } catch (error: any) {
      console.error('Error updating designation:', error);
      if (error.response?.data?.message) {
        toast.error(`Error: ${error.response.data.message}`);
      } else {
        toast.error('Failed to update designation. Please try again.');
      }
    } finally {
      setSavingDesignation(false);
    }
  };

  const handleDeleteDesignation = (designation: Designation) => {
    setDeletingDesignation(designation);
    setDeleteDesignationModalOpen(true);
  };

  const confirmDeleteDesignation = async () => {
    if (!deletingDesignation) return;

    setSavingDesignation(true);
    try {
      const response = await axios.delete(`/designations/${deletingDesignation.id}`);
      
      if (response.data) {
        // Refresh designations list
        await fetchDesignations();
        // Close modal and reset
        setDeleteDesignationModalOpen(false);
        setDeletingDesignation(null);
        toast.success('Designation deleted successfully!');
      }
    } catch (error: any) {
      console.error('Error deleting designation:', error);
      if (error.response?.data?.message) {
        toast.error(`Error: ${error.response.data.message}`);
      } else {
        toast.error('Failed to delete designation. Please try again.');
      }
    } finally {
      setSavingDesignation(false);
    }
  };
  
  // Ticket Labels Functions
  const fetchTicketLabels = async () => {
    setLoadingTicketLabels(true);
    setErrorTicketLabels(null);
    
    try {
      const response = await axios.get('/ticket-labels-management');
      setAllTicketLabels(response.data);
      setFilteredTicketLabels(response.data);
    } catch (error: any) {
      console.error('Error fetching ticket labels:', error);
      setErrorTicketLabels(error.response?.data?.message || error.message || 'Failed to fetch ticket labels');
    } finally {
      setLoadingTicketLabels(false);
    }
  };
  
  const handlePerPageChangeTicketLabels = (value: string) => {
    setPerPageTicketLabels(parseInt(value));
    setCurrentPageTicketLabels(1);
  };
  
  const handleSearchChangeTicketLabels = (value: string) => {
    setSearchTermTicketLabels(value);
    setCurrentPageTicketLabels(1);
    
    if (value.trim() === '') {
      setFilteredTicketLabels(allTicketLabels);
    } else {
      const filtered = allTicketLabels.filter(label =>
        label.label_name.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredTicketLabels(filtered);
    }
  };
  
  const handleAddTicketLabel = async () => {
    if (!newTicketLabelName.trim() || !newTicketLabelColor) return;

    setSavingTicketLabel(true);
    try {
      const response = await axios.post('/ticket-labels-management', {
        label: newTicketLabelName.trim(),
        color: newTicketLabelColor
      });
      
      if (response.data) {
        // Refresh ticket labels list
        await fetchTicketLabels();
        // Clear the inputs
        setNewTicketLabelName('');
        setNewTicketLabelColor('#3B82F6');
        toast.success('Ticket label added successfully!');
      }
    } catch (error: any) {
      console.error('Error adding ticket label:', error);
      if (error.response?.data?.message) {
        toast.error(`Error: ${error.response.data.message}`);
      } else {
        toast.error('Failed to add ticket label. Please try again.');
      }
    } finally {
      setSavingTicketLabel(false);
    }
  };
  
  const handleEditTicketLabel = (label: TicketLabel) => {
    setEditingTicketLabel(label);
    setEditTicketLabelName(label.label_name);
    setEditTicketLabelColor(label.color);
    setEditTicketLabelModalOpen(true);
  };
  
  const handleUpdateTicketLabel = async () => {
    if (!editingTicketLabel || !editTicketLabelName.trim() || !editTicketLabelColor) return;

    setSavingTicketLabel(true);
    try {
      const response = await axios.put(`/ticket-labels-management/${editingTicketLabel.id}`, {
        label: editTicketLabelName.trim(),
        color: editTicketLabelColor,
        active: editingTicketLabel.active
      });
      
      if (response.data) {
        // Refresh ticket labels list
        await fetchTicketLabels();
        // Close modal and reset
        setEditTicketLabelModalOpen(false);
        setEditingTicketLabel(null);
        setEditTicketLabelName('');
        setEditTicketLabelColor('#3B82F6');
        toast.success('Ticket label updated successfully!');
      }
    } catch (error: any) {
      console.error('Error updating ticket label:', error);
      if (error.response?.data?.message) {
        toast.error(`Error: ${error.response.data.message}`);
      } else {
        toast.error('Failed to update ticket label. Please try again.');
      }
    } finally {
      setSavingTicketLabel(false);
    }
  };
  
  const handleDeleteTicketLabel = (label: TicketLabel) => {
    setDeletingTicketLabel(label);
    setDeleteTicketLabelModalOpen(true);
  };
  
  const confirmDeleteTicketLabel = async () => {
    if (!deletingTicketLabel) return;
    setSavingTicketLabel(true);
    try {
      const response = await axios.delete(`/ticket-labels-management/${deletingTicketLabel.id}`);
      
      if (response.data) {
        // Refresh ticket labels list
        await fetchTicketLabels();
        // Close modal and reset
        setDeleteTicketLabelModalOpen(false);
        setDeletingTicketLabel(null);
        toast.success('Ticket label deleted successfully!');
      }
    } catch (error: any) {
      console.error('Error deleting ticket label:', error);
      if (error.response?.data?.message) {
        toast.error(`Error: ${error.response.data.message}`);
      } else {
        toast.error('Failed to delete ticket label. Please try again.');
      }
    } finally {
      setSavingTicketLabel(false);
    }
  };
  
  // Additional Fields Functions
  const fetchAdditionalFields = async () => {
    setLoadingAdditionalFields(true);
    setErrorAdditionalFields(null);
    
    try {
      const response = await axios.get('/additional-fields');
      setAllAdditionalFields(response.data);
      setFilteredAdditionalFields(response.data);
    } catch (error: any) {
      console.error('Error fetching additional fields:', error);
      setErrorAdditionalFields(error.response?.data?.message || error.message || 'Failed to fetch additional fields');
    } finally {
      setLoadingAdditionalFields(false);
    }
  };

  // QR Code functions
  const fetchQRCodes = async () => {
    setLoadingQRCodes(true);
    
    try {
      const response = await axios.get('/qrcodes');
      setQrcodes(response.data);
    } catch (error: any) {
      console.error('Error fetching QR codes:', error);
      toast.error('Failed to fetch QR codes');
    } finally {
      setLoadingQRCodes(false);
    }
  };

  const handleGenerateQRCode = async () => {
    if (!selectedQRBranch) {
      toast.error('Please select a branch');
      return;
    }

    if (!qrcodeLink.trim()) {
      toast.error('Please enter a valid link');
      return;
    }

    setGeneratingQRCode(true);

    try {
      // The link already contains the branch ID as query parameter from useEffect
      // Use it directly since it's already in the correct format
      const response = await axios.post('/qrcodes/generate', {
        web_link: qrcodeLink
      });

      if (response.data.success) {
        toast.success('QR code generated successfully');
        setQrcodes([response.data.qrcode, ...qrcodes]);
        setQrcodeLink(`${window.location.origin}/register`); // Reset to default
        setSelectedQRBranch(''); // Reset branch selection
      }
    } catch (error: any) {
      console.error('Error generating QR code:', error);
      toast.error(error.response?.data?.message || 'Failed to generate QR code');
    } finally {
      setGeneratingQRCode(false);
    }
  };

  const handleDeleteQRCode = async () => {
    if (!deletingQRCode) return;

    try {
      const response = await axios.delete(`/qrcodes/${deletingQRCode.id}`);
      
      if (response.data.success) {
        toast.success('QR code deleted successfully');
        setQrcodes(qrcodes.filter(qr => qr.id !== deletingQRCode.id));
        setDeleteQRCodeModalOpen(false);
        setDeletingQRCode(null);
      }
    } catch (error: any) {
      console.error('Error deleting QR code:', error);
      toast.error(error.response?.data?.message || 'Failed to delete QR code');
    }
  };
  
  const handlePerPageChangeAdditionalFields = (value: string) => {
    setPerPageAdditionalFields(parseInt(value));
    setCurrentPageAdditionalFields(1);
  };
  
  const handleSearchChangeAdditionalFields = (value: string) => {
    setSearchTermAdditionalFields(value);
    setCurrentPageAdditionalFields(1);
    
    if (value.trim() === '') {
      setFilteredAdditionalFields(allAdditionalFields);
    } else {
      const filtered = allAdditionalFields.filter(field =>
        field.title.toLowerCase().includes(value.toLowerCase()) ||
        field.name.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredAdditionalFields(filtered);
    }
  };
  
  const handleAddFieldValue = () => {
    setNewFieldValues([...newFieldValues, '']);
  };
  
  const handleRemoveFieldValue = (index: number) => {
    const values = newFieldValues.filter((_, i) => i !== index);
    setNewFieldValues(values.length > 0 ? values : ['']);
  };
  
  const handleFieldValueChange = (index: number, value: string) => {
    const values = [...newFieldValues];
    values[index] = value;
    setNewFieldValues(values);
  };
  
  const handleAddAdditionalField = async () => {
    if (!newFieldTitle.trim() || !newFieldName.trim()) return;
    
    // For select type, check if at least one value is provided
    if (newFieldType === '1') {
      const validValues = newFieldValues.filter(v => v.trim());
      if (validValues.length === 0) {
        toast.error('Please provide at least one value for SELECT field type');
        return;
      }
    }
    
    setSavingAdditionalField(true);
    try {
      const payload: any = {
        title: newFieldTitle.trim(),
        name: newFieldName.trim(),
        type: newFieldType,
        mandatory: newFieldMandatory,
        show_filter: newFieldShowFilter,
        show_list: newFieldShowList,
      };
      
      if (newFieldType === '1') {
        payload.value = newFieldValues.filter(v => v.trim());
        payload.selection = newFieldMultiselect ? 'multiple' : 'single';
      }
      
      const response = await axios.post('/additional-fields', payload);
      
      if (response.data) {
        // Refresh additional fields list
        await fetchAdditionalFields();
        // Clear the form
        setNewFieldTitle('');
        setNewFieldName('');
        setNewFieldType('1');
        setNewFieldMandatory(false);
        setNewFieldShowFilter(false);
        setNewFieldShowList(false);
        setNewFieldMultiselect(false);
        setNewFieldValues(['']);
        toast.success('Additional field added successfully!');
      }
    } catch (error: any) {
      console.error('Error adding additional field:', error);
      if (error.response?.data?.message) {
        toast.error(`Error: ${error.response.data.message}`);
      } else {
        toast.error('Failed to add additional field. Please try again.');
      }
    } finally {
      setSavingAdditionalField(false);
    }
  };
  
  const handleEditAdditionalField = (field: AdditionalField) => {
    setEditingAdditionalField(field);
    setEditFieldTitle(field.title);
    setEditFieldName(field.name);
    // Convert type back to number string
    let typeNum = '1';
    if (field.type === 'text') typeNum = '2';
    else if (field.type === 'date') typeNum = '3';
    setEditFieldType(typeNum);
    setEditFieldMandatory(field.mandatory === 1);
    setEditFieldShowFilter(field.show_filter === 1);
    setEditFieldShowList(field.show_list === 1);
    setEditFieldMultiselect(field.selection === 'multiple');
    // Extract just the values from the formatted structure
    if (field.value && field.value.length > 0) {
      setEditFieldValues(field.value.map(v => v.value));
    } else {
      setEditFieldValues(['']);
    }
    setEditAdditionalFieldModalOpen(true);
  };
  
  const handleEditFieldValueChange = (index: number, value: string) => {
    const values = [...editFieldValues];
    values[index] = value;
    setEditFieldValues(values);
  };
  
  const handleAddEditFieldValue = () => {
    setEditFieldValues([...editFieldValues, '']);
  };
  
  const handleRemoveEditFieldValue = (index: number) => {
    const values = editFieldValues.filter((_, i) => i !== index);
    setEditFieldValues(values.length > 0 ? values : ['']);
  };
  
  const handleUpdateAdditionalField = async () => {
    if (!editingAdditionalField || !editFieldTitle.trim() || !editFieldName.trim()) return;
    
    // For select type, check if at least one value is provided
    if (editFieldType === '1') {
      const validValues = editFieldValues.filter(v => v.trim());
      if (validValues.length === 0) {
        toast.error('Please provide at least one value for SELECT field type');
        return;
      }
    }
    
    setSavingAdditionalField(true);
    try {
      const payload: any = {
        title: editFieldTitle.trim(),
        name: editFieldName.trim(),
        type: editFieldType,
        mandatory: editFieldMandatory,
        show_filter: editFieldShowFilter,
        show_list: editFieldShowList,
      };
      
      if (editFieldType === '1') {
        payload.value = editFieldValues.filter(v => v.trim());
        payload.selection = editFieldMultiselect ? 'multiple' : 'single';
      }
      
      const response = await axios.put(`/additional-fields/${editingAdditionalField.id}`, payload);
      
      if (response.data) {
        // Refresh additional fields list
        await fetchAdditionalFields();
        // Close modal and reset
        setEditAdditionalFieldModalOpen(false);
        setEditingAdditionalField(null);
        setEditFieldTitle('');
        setEditFieldName('');
        setEditFieldType('1');
        setEditFieldMandatory(false);
        setEditFieldShowFilter(false);
        setEditFieldShowList(false);
        setEditFieldMultiselect(false);
        setEditFieldValues(['']);
        toast.success('Additional field updated successfully!');
      }
    } catch (error: any) {
      console.error('Error updating additional field:', error);
      if (error.response?.data?.message) {
        toast.error(`Error: ${error.response.data.message}`);
      } else {
        toast.error('Failed to update additional field. Please try again.');
      }
    } finally {
      setSavingAdditionalField(false);
    }
  };
  
  const handleDeleteAdditionalField = (field: AdditionalField) => {
    setDeletingAdditionalField(field);
    setDeleteAdditionalFieldModalOpen(true);
  };
  
  const confirmDeleteAdditionalField = async () => {
    if (!deletingAdditionalField) return;
    setSavingAdditionalField(true);
    try {
      const response = await axios.delete(`/additional-fields/${deletingAdditionalField.id}`);
      
      if (response.data) {
        // Refresh additional fields list
        await fetchAdditionalFields();
        // Close modal and reset
        setDeleteAdditionalFieldModalOpen(false);
        setDeletingAdditionalField(null);
        toast.success('Additional field deleted successfully!');
      }
    } catch (error: any) {
      console.error('Error deleting additional field:', error);
      if (error.response?.data?.message) {
        toast.error(`Error: ${error.response.data.message}`);
      } else {
        toast.error('Failed to delete additional field. Please try again.');
      }
    } finally {
      setSavingAdditionalField(false);
    }
  };

  const confirmDeleteDepartment = async () => {
    if (!deletingDepartment) return;

    setSavingDepartment(true);
    try {
      const response = await axios.delete(`/departments/${deletingDepartment.id}`);
      
      if (response.data) {
        // Refresh departments list
        await fetchDepartments();
        // Close modal and reset
        setDeleteDepartmentModalOpen(false);
        setDeletingDepartment(null);
        toast.success('Department deleted successfully!');
      }
    } catch (error: any) {
      console.error('Error deleting department:', error);
      if (error.response?.data?.message) {
        toast.error(`Error: ${error.response.data.message}`);
      } else {
        toast.error('Failed to delete department. Please try again.');
      }
    } finally {
      setSavingDepartment(false);
    }
  };

  const confirmDeleteCategory = async () => {
    if (!deletingCategory) return;

    setSavingCategory(true);
    try {
      const response = await axios.delete(`/categories/${deletingCategory.id}`);
      
      if (response.data) {
        // Refresh categories list
        await fetchCategories();
        // Close modal and reset
        setDeleteCategoryModalOpen(false);
        setDeletingCategory(null);
        toast.success('Category deleted successfully!');
      }
    } catch (error: any) {
      console.error('Error deleting category:', error);
      if (error.response?.data?.message) {
        toast.error(`Error: ${error.response.data.message}`);
      } else {
        toast.error('Failed to delete category. Please try again.');
      }
    } finally {
      setSavingCategory(false);
    }
  };

  // Notification Settings Functions
  const fetchNotificationSettings = async () => {
    setLoadingMessages(true);
    try {
      const params: any = {
        page: currentPageMessages,
        per_page: perPageMessages,
      };

      if (messageTypeFilter !== 'all') {
        params.message_type = messageTypeFilter;
      }

      const response = await axios.get('/message-settings', { params });

      // Handle the response data
      const data = response.data.data || response.data || [];
      setMessageSettings(Array.isArray(data) ? data : []);
      setTotalPagesMessages(response.data.last_page || 1);

      console.log('Fetched notification settings:', data);
    } catch (error: any) {
      console.error('Error fetching notification settings:', error);
      // Check if it's a 404 (table doesn't exist yet)
      if (error.response?.status === 404) {
        console.log('Notification settings endpoint not found, table may not exist yet');
      }
      setMessageSettings([]);
      setTotalPagesMessages(1);
    } finally {
      setLoadingMessages(false);
    }
  };

  const handleSaveNotificationSetting = async () => {
    // Validate required fields
    if (!messageFormData.vendor_name || !messageFormData.vendor_name.trim()) {
      toast.error('Please enter a vendor name');
      return;
    }

    if (!messageFormData.whatsapp_api || !messageFormData.whatsapp_api.trim()) {
      toast.error('Please enter a WhatsApp API URL');
      return;
    }

    try {
      const dataToSubmit: any = { ...messageFormData };

      // Convert status to number
      dataToSubmit.status = dataToSubmit.status ? 1 : 0;

      // If editing and api_token is empty, don't send it
      // This tells the backend to keep the existing value
      if (editingMessage) {
        if (!dataToSubmit.api_token || dataToSubmit.api_token.trim() === '') {
          delete dataToSubmit.api_token;
        }
      }

      if (editingMessage) {
        // Update existing WhatsApp setting
        await axios.put(`/message-settings/${editingMessage.id}`, dataToSubmit);
        toast.success('WhatsApp setting updated successfully');
      } else {
        // Check if a record with the same vendor_name or whatsapp_api already exists
        const existingRecord = messageSettings.find(
          (msg) =>
            msg.vendor_name?.toLowerCase() === dataToSubmit.vendor_name.toLowerCase() ||
            msg.whatsapp_api?.toLowerCase() === dataToSubmit.whatsapp_api.toLowerCase()
        );

        if (existingRecord) {
          // Update existing record instead of creating new
          await axios.put(`/message-settings/${existingRecord.id}`, dataToSubmit);
          toast.success('WhatsApp setting updated successfully (existing record found)');
        } else {
          // Create new WhatsApp setting
          await axios.post('/message-settings', dataToSubmit);
          toast.success('WhatsApp setting created successfully');
        }
      }

      // Refresh the list
      await fetchNotificationSettings();

      // Close modal and reset form
      setMessageModalOpen(false);
      setEditingMessage(null);
      setMessageFormData({
        vendor_name: '',
        whatsapp_api: '',
        api_token: '',
        phone_number_id: '',
        status: true,
      });
    } catch (error: any) {
      console.error('Error saving WhatsApp setting:', error);
      if (error.response?.data?.errors) {
        const firstError = Object.values(error.response.data.errors)[0];
        toast.error(Array.isArray(firstError) ? firstError[0] : firstError);
      } else if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error('Failed to save WhatsApp setting');
      }
    }
  };

  const handleToggleStatus = async (message: any) => {
    try {
      const newStatus = !message.status;
      await axios.put(`/message-settings/${message.id}`, {
        vendor_name: message.vendor_name,
        whatsapp_api: message.whatsapp_api,
        status: newStatus ? 1 : 0
      });

      toast.success(`Status changed to ${newStatus ? 'Active' : 'Inactive'}`);

      // Refresh the list
      await fetchNotificationSettings();
    } catch (error: any) {
      console.error('Error toggling status:', error);
      toast.error('Failed to update status');
    }
  };

  const handleDeleteNotificationSetting = async () => {
    if (!deletingMessage) return;

    try {
      await axios.delete(`/message-settings/${deletingMessage.id}`);
      toast.success('Notification setting deleted successfully');
      await fetchNotificationSettings();
      setDeleteMessageModalOpen(false);
      setDeletingMessage(null);
    } catch (error: any) {
      console.error('Error deleting notification setting:', error);
      toast.error('Failed to delete notification setting');
    }
  };

  // SMS Settings handlers
  const fetchSmsSettings = async () => {
    try {
      setLoadingSms(true);
      const params: any = {
        per_page: perPageSms,
        page: currentPageSms,
        search: searchTermSms || undefined,
      };

      const response = await axios.get('/sms-settings', { params });

      // Handle the response data
      const data = response.data.data || response.data || [];
      setSmsSettings(Array.isArray(data) ? data : []);
      setTotalPagesSms(response.data.last_page || 1);

      console.log('Fetched SMS settings:', data);
    } catch (error: any) {
      console.error('Error fetching SMS settings:', error);
      if (error.response?.status === 404) {
        console.log('SMS settings endpoint not found, table may not exist yet');
      }
      setSmsSettings([]);
      setTotalPagesSms(1);
    } finally {
      setLoadingSms(false);
    }
  };

  const handleSaveSms = async () => {
    // Validate required fields
    if (!smsFormData.vendor_name || !smsFormData.vendor_name.trim()) {
      toast.error('Please enter a vendor name');
      return;
    }

    if (!smsFormData.sms_api || !smsFormData.sms_api.trim()) {
      toast.error('Please enter an SMS API URL');
      return;
    }

    try {
      const dataToSubmit: any = { ...smsFormData };

      // Convert status to number
      dataToSubmit.status = dataToSubmit.status ? 1 : 0;

      // If editing and api_token is empty, don't send it
      if (editingSms) {
        if (!dataToSubmit.api_token || dataToSubmit.api_token.trim() === '') {
          delete dataToSubmit.api_token;
        }
      }

      if (editingSms) {
        // Update existing SMS setting
        await axios.put(`/sms-settings/${editingSms.id}`, dataToSubmit);
        toast.success('SMS setting updated successfully');
      } else {
        // Create new SMS setting
        await axios.post('/sms-settings', dataToSubmit);
        toast.success('SMS setting created successfully');
      }

      // Refresh the list
      await fetchSmsSettings();

      // Close modal and reset form
      setSmsModalOpen(false);
      setEditingSms(null);
      setSmsFormData({
        vendor_name: '',
        sms_api: '',
        api_token: '',
        sender_id: '',
        status: true,
      });
    } catch (error: any) {
      console.error('Error saving SMS setting:', error);
      if (error.response?.data?.errors) {
        const firstError = Object.values(error.response.data.errors)[0];
        toast.error(Array.isArray(firstError) ? firstError[0] : firstError);
      } else if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error('Failed to save SMS setting');
      }
    }
  };

  const handleToggleSmsStatus = async (sms: any) => {
    try {
      const newStatus = !sms.status;
      await axios.put(`/sms-settings/${sms.id}`, {
        vendor_name: sms.vendor_name,
        sms_api: sms.sms_api,
        status: newStatus ? 1 : 0
      });

      toast.success(`Status changed to ${newStatus ? 'Active' : 'Inactive'}`);

      // Refresh the list
      await fetchSmsSettings();
    } catch (error: any) {
      console.error('Error toggling SMS status:', error);
      toast.error('Failed to update status');
    }
  };

  const handleDeleteSms = async () => {
    if (!deletingSms) return;

    try {
      await axios.delete(`/sms-settings/${deletingSms.id}`);
      toast.success('SMS setting deleted successfully');
      await fetchSmsSettings();
      setDeleteSmsModalOpen(false);
      setDeletingSms(null);
    } catch (error: any) {
      console.error('Error deleting SMS setting:', error);
      toast.error('Failed to delete SMS setting');
    }
  };

  // Add useEffect to fetch notification settings when the tab is active
  useEffect(() => {
    // Only fetch if we're on the notification settings tab
    const tabElement = document.querySelector('[data-state="active"][value="notification-settings"]');
    if (tabElement) {
      fetchNotificationSettings();
    }
  }, [currentPageMessages, perPageMessages, messageTypeFilter]);

  // Add useEffect to fetch SMS settings when the tab is active
  useEffect(() => {
    const tabElement = document.querySelector('[data-state="active"][value="sms-settings"]');
    if (tabElement) {
      fetchSmsSettings();
    }
  }, [currentPageSms, perPageSms, searchTermSms]);

  // Fetch Telegram Notification Settings
  const fetchTelegramSettings = async () => {
    setLoadingTelegramSettings(true);
    try {
      const response = await axios.get('/telegram-notification-settings');
      setTelegramSettings(Array.isArray(response.data) ? response.data : []);
    } catch (error: any) {
      console.error('Error fetching telegram notification settings:', error);
      setTelegramSettings([]);
    } finally {
      setLoadingTelegramSettings(false);
    }
  };

  // Toggle Telegram Notification Setting
  const handleToggleTelegramSetting = async (settingId: number) => {
    setTogglingTelegramSetting(settingId);
    try {
      const response = await axios.put(`/telegram-notification-settings/${settingId}/toggle`);
      toast.success('Notification setting updated successfully');
      // Update local state
      setTelegramSettings(prev =>
        prev.map(setting =>
          setting.id === settingId
            ? { ...setting, is_active: !setting.is_active }
            : setting
        )
      );
    } catch (error: any) {
      console.error('Error toggling telegram setting:', error);
      // Check if credentials are missing
      if (error.response?.data?.credentials_missing) {
        setTelegramCredentialsAlertOpen(true);
      } else {
        toast.error('Failed to update notification setting');
      }
    } finally {
      setTogglingTelegramSetting(null);
    }
  };

  // Company Logo Functions
  const fetchCompanyLogos = async () => {
    setLoadingLogos(true);
    setErrorLogos(null);
    
    try {
      const response = await axios.get('/company-logos', {
        params: {
          page: currentPageLogos,
          per_page: perPageLogos,
          search: searchTermLogos
        }
      });
      
      setCompanyLogos(response.data.data);
      setCurrentPageLogos(response.data.current_page);
      setTotalPagesLogos(response.data.last_page);
      setTotalLogos(response.data.total);
    } catch (error: any) {
      console.error('Error fetching company logos:', error);
      setErrorLogos(error.response?.data?.message || error.message || 'Failed to fetch company logos');
    } finally {
      setLoadingLogos(false);
    }
  };

  const handleAddLogo = async () => {
    if (!logoFormData.logo_image) {
      toast.error('Please select a logo image');
      return;
    }

    setSavingLogo(true);
    try {
      const formData = new FormData();
      formData.append('logo_image', logoFormData.logo_image);
      if (logoFormData.name) formData.append('name', logoFormData.name);
      formData.append('type', logoFormData.type);
      formData.append('is_active', logoFormData.is_active ? '1' : '0');

      const response = await axios.post('/company-logos', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data) {
        await fetchCompanyLogos();
        setLogoFormData({ name: '', type: 'Logo', logo_image: null, is_active: true });
        toast.success('Company logo added successfully!');
      }
    } catch (error: any) {
      console.error('Error adding company logo:', error);
      console.log('Error response:', error.response?.data);
      if (error.response?.data?.errors) {
        // Show specific validation errors
        const errorMessages = Object.values(error.response.data.errors).flat();
        toast.error(`Validation Error: ${errorMessages.join(', ')}`);
      } else if (error.response?.data?.message) {
        toast.error(`Error: ${error.response.data.message}`);
      } else {
        toast.error('Failed to add company logo. Please try again.');
      }
    } finally {
      setSavingLogo(false);
    }
  };

  const handleEditLogo = (logo: CompanyLogo) => {
    setEditingLogo(logo);
    setLogoFormData({
      name: logo.name || '',
      type: logo.type || 'Logo',
      logo_image: null,
      is_active: logo.is_active
    });
    setEditLogoModalOpen(true);
  };

  const handleUpdateLogo = async () => {
    if (!editingLogo) return;

    setSavingLogo(true);
    try {
      const formData = new FormData();
      if (logoFormData.name) formData.append('name', logoFormData.name);
      formData.append('type', logoFormData.type);
      if (logoFormData.logo_image) formData.append('logo_image', logoFormData.logo_image);
      formData.append('is_active', logoFormData.is_active ? '1' : '0');

      const response = await axios.post(`/company-logos/${editingLogo.id}?_method=PUT`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data) {
        await fetchCompanyLogos();
        setEditLogoModalOpen(false);
        setEditingLogo(null);
        setLogoFormData({ name: '', type: 'Logo', logo_image: null, is_active: true });
        toast.success('Company logo updated successfully!');
      }
    } catch (error: any) {
      console.error('Error updating company logo:', error);
      console.log('Error response:', error.response?.data);
      if (error.response?.data?.errors) {
        // Show specific validation errors
        const errorMessages = Object.values(error.response.data.errors).flat();
        toast.error(`Validation Error: ${errorMessages.join(', ')}`);
      } else if (error.response?.data?.message) {
        toast.error(`Error: ${error.response.data.message}`);
      } else {
        toast.error('Failed to update company logo. Please try again.');
      }
    } finally {
      setSavingLogo(false);
    }
  };

  const handleDeleteLogo = (logo: CompanyLogo) => {
    setDeletingLogo(logo);
    setDeleteLogoModalOpen(true);
  };

  const confirmDeleteLogo = async () => {
    if (!deletingLogo) return;

    setSavingLogo(true);
    try {
      const response = await axios.delete(`/company-logos/${deletingLogo.id}`);

      if (response.data) {
        await fetchCompanyLogos();
        setDeleteLogoModalOpen(false);
        setDeletingLogo(null);
        toast.success('Company logo deleted successfully!');
      }
    } catch (error: any) {
      console.error('Error deleting company logo:', error);
      if (error.response?.data?.message) {
        toast.error(`Error: ${error.response.data.message}`);
      } else {
        toast.error('Failed to delete company logo. Please try again.');
      }
    } finally {
      setSavingLogo(false);
    }
  };

  const handleLogoFormChange = (field: string, value: any) => {
    setLogoFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <DashboardLayout title="Settings">
      <div className="p-3 sm:p-6 space-y-4 sm:space-y-6">
        <div className="bg-white rounded-lg shadow-sm p-3 sm:p-6">
          <Tabs
            defaultValue="users"
            className="w-full flex flex-col lg:flex-row gap-4 lg:gap-6"
            orientation="vertical"
            onValueChange={(value) => {
              if (value === 'notification-settings') {
                fetchNotificationSettings();
              }
              if (value === 'sms-settings') {
                fetchSmsSettings();
              }
              if (value === 'telegram-notifications') {
                fetchTelegramSettings();
              }
              if (value === 'company-logo') {
                fetchCompanyLogos();
              }
            }}
          >
            {/* Desktop vertical tabs */}
            <TabsList className="hidden lg:flex flex-col h-fit w-[200px] p-1 bg-gray-50 justify-start">
              <TabsTrigger value="users" className="w-full justify-start text-sm px-3 py-2 mt-[5px] data-[state=active]:bg-purple-100 data-[state=active]:text-purple-900 data-[state=active]:shadow-sm flex items-center gap-2">
                <User className="h-4 w-4" />
                User Settings
              </TabsTrigger>
              <TabsTrigger value="company-logo" className="w-full justify-start text-sm px-3 py-2 mt-[5px] data-[state=active]:bg-purple-100 data-[state=active]:text-purple-900 data-[state=active]:shadow-sm flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                Logo & Favicon
              </TabsTrigger>
              {/* Show Roles tab only for role_id=1 (Admin) */}
              {currentUser?.role_id === 1 && (
                <TabsTrigger value="roles" className="w-full justify-start text-sm px-3 py-2 mt-[5px] data-[state=active]:bg-purple-100 data-[state=active]:text-purple-900 data-[state=active]:shadow-sm flex items-center gap-2">
                  <Lock className="h-4 w-4" />
                  Roles
                </TabsTrigger>
              )}
              {/* Show Branches tab only for role_id=1 (Admin) */}
              {currentUser?.role_id === 1 && (
                <TabsTrigger value="branches" className="w-full justify-start text-sm px-3 py-2 mt-[5px] data-[state=active]:bg-purple-100 data-[state=active]:text-purple-900 data-[state=active]:shadow-sm flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Branches
                </TabsTrigger>
              )}
              <TabsTrigger value="brands" className="w-full justify-start text-sm px-3 py-2 mt-[5px] data-[state=active]:bg-purple-100 data-[state=active]:text-purple-900 data-[state=active]:shadow-sm flex items-center gap-2">
                <Package className="h-4 w-4" />
                Brands
              </TabsTrigger>
              <TabsTrigger value="categories" className="w-full justify-start text-sm px-3 py-2 mt-[5px] data-[state=active]:bg-purple-100 data-[state=active]:text-purple-900 data-[state=active]:shadow-sm flex items-center gap-2">
                <FolderOpen className="h-4 w-4" />
                Categories
              </TabsTrigger>
              <TabsTrigger value="departments" className="w-full justify-start text-sm px-3 py-2 mt-[5px] data-[state=active]:bg-purple-100 data-[state=active]:text-purple-900 data-[state=active]:shadow-sm flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                Departments
              </TabsTrigger>
              <TabsTrigger value="designations" className="w-full justify-start text-sm px-3 py-2 mt-[5px] data-[state=active]:bg-purple-100 data-[state=active]:text-purple-900 data-[state=active]:shadow-sm flex items-center gap-2">
                <Briefcase className="h-4 w-4" />
                Designations
              </TabsTrigger>
              <TabsTrigger value="ticket-labels" className="w-full justify-start text-sm px-3 py-2 mt-[5px] data-[state=active]:bg-purple-100 data-[state=active]:text-purple-900 data-[state=active]:shadow-sm flex items-center gap-2">
                <Tags className="h-4 w-4" />
                Ticket Labels
              </TabsTrigger>
              {/* Show Additional Fields tab only for role_id=1 (Admin) */}
              {currentUser?.role_id === 1 && (
                <TabsTrigger value="additional-fields" className="w-full justify-start text-sm px-3 py-2 mt-[5px] data-[state=active]:bg-purple-100 data-[state=active]:text-purple-900 data-[state=active]:shadow-sm flex items-center gap-2">
                  <Database className="h-4 w-4" />
                  Additional Fields
                </TabsTrigger>
              )}
              <TabsTrigger value="qr-codes" className="w-full justify-start text-sm px-3 py-2 mt-[5px] data-[state=active]:bg-purple-100 data-[state=active]:text-purple-900 data-[state=active]:shadow-sm flex items-center gap-2">
                <QrCode className="h-4 w-4" />
                QR Codes
              </TabsTrigger>
              {/* Show Whatsapp Settings tab only for role_id=1 (Admin) */}
              {currentUser?.role_id === 1 && (
                <TabsTrigger value="notification-settings" className="w-full justify-start text-sm px-3 py-2 mt-[5px] data-[state=active]:bg-purple-100 data-[state=active]:text-purple-900 data-[state=active]:shadow-sm flex items-center gap-2">
                  <MessageCircle className="h-4 w-4" />
                  Whatsapp Settings
                </TabsTrigger>
              )}
              {/* Show SMS Settings tab only for role_id=1 (Admin) */}
              {currentUser?.role_id === 1 && (
                <TabsTrigger value="sms-settings" className="w-full justify-start text-sm px-3 py-2 mt-[5px] data-[state=active]:bg-purple-100 data-[state=active]:text-purple-900 data-[state=active]:shadow-sm flex items-center gap-2">
                  <MessageCircle className="h-4 w-4" />
                  SMS Settings
                </TabsTrigger>
              )}
              {/* Show Telegram Settings tab only for role_id=1 (Admin) */}
              {currentUser?.role_id === 1 && (
                <TabsTrigger value="telegram-notifications" className="w-full justify-start text-sm px-3 py-2 mt-[5px] data-[state=active]:bg-purple-100 data-[state=active]:text-purple-900 data-[state=active]:shadow-sm flex items-center gap-2">
                  <Send className="h-4 w-4" />
                  Telegram Settings
                </TabsTrigger>
              )}
            </TabsList>

            {/* Mobile horizontal scrollable tabs */}
            <TabsList className="flex lg:hidden flex-row w-full p-1 bg-gray-50 justify-start overflow-x-auto">
              <TabsTrigger value="users" className="min-w-fit px-3 py-2 data-[state=active]:bg-purple-100 data-[state=active]:text-purple-900 data-[state=active]:shadow-sm flex items-center gap-1 text-xs">
                <User className="h-3 w-3" />
                Users
              </TabsTrigger>
              <TabsTrigger value="company-logo" className="min-w-fit px-3 py-2 data-[state=active]:bg-purple-100 data-[state=active]:text-purple-900 data-[state=active]:shadow-sm flex items-center gap-1 text-xs">
                <Building2 className="h-3 w-3" />
                Logo & Favicon
              </TabsTrigger>
              {/* Show Roles tab only for role_id=1 (Admin) */}
              {currentUser?.role_id === 1 && (
                <TabsTrigger value="roles" className="min-w-fit px-3 py-2 data-[state=active]:bg-purple-100 data-[state=active]:text-purple-900 data-[state=active]:shadow-sm flex items-center gap-1 text-xs">
                  <Lock className="h-3 w-3" />
                  Roles
                </TabsTrigger>
              )}
              {/* Show Branches tab only for role_id=1 (Admin) */}
              {currentUser?.role_id === 1 && (
                <TabsTrigger value="branches" className="min-w-fit px-3 py-2 data-[state=active]:bg-purple-100 data-[state=active]:text-purple-900 data-[state=active]:shadow-sm flex items-center gap-1 text-xs">
                  <MapPin className="h-3 w-3" />
                  Branches
                </TabsTrigger>
              )}
              <TabsTrigger value="brands" className="min-w-fit px-3 py-2 data-[state=active]:bg-purple-100 data-[state=active]:text-purple-900 data-[state=active]:shadow-sm flex items-center gap-1 text-xs">
                <Package className="h-3 w-3" />
                Brands
              </TabsTrigger>
              <TabsTrigger value="categories" className="min-w-fit px-3 py-2 data-[state=active]:bg-purple-100 data-[state=active]:text-purple-900 data-[state=active]:shadow-sm flex items-center gap-1 text-xs">
                <FolderOpen className="h-3 w-3" />
                Categories
              </TabsTrigger>
              <TabsTrigger value="departments" className="min-w-fit px-3 py-2 data-[state=active]:bg-purple-100 data-[state=active]:text-purple-900 data-[state=active]:shadow-sm flex items-center gap-1 text-xs">
                <Building2 className="h-3 w-3" />
                Departments
              </TabsTrigger>
              <TabsTrigger value="designations" className="min-w-fit px-3 py-2 data-[state=active]:bg-purple-100 data-[state=active]:text-purple-900 data-[state=active]:shadow-sm flex items-center gap-1 text-xs">
                <Briefcase className="h-3 w-3" />
                Designations
              </TabsTrigger>
              <TabsTrigger value="ticket-labels" className="min-w-fit px-3 py-2 data-[state=active]:bg-purple-100 data-[state=active]:text-purple-900 data-[state=active]:shadow-sm flex items-center gap-1 text-xs">
                <Tags className="h-3 w-3" />
                Labels
              </TabsTrigger>
              {/* Show Additional Fields tab only for role_id=1 (Admin) */}
              {currentUser?.role_id === 1 && (
                <TabsTrigger value="additional-fields" className="min-w-fit px-3 py-2 data-[state=active]:bg-purple-100 data-[state=active]:text-purple-900 data-[state=active]:shadow-sm flex items-center gap-1 text-xs">
                  <Database className="h-3 w-3" />
                  Fields
                </TabsTrigger>
              )}
              <TabsTrigger value="qr-codes" className="min-w-fit px-3 py-2 data-[state=active]:bg-purple-100 data-[state=active]:text-purple-900 data-[state=active]:shadow-sm flex items-center gap-1 text-xs">
                <QrCode className="h-3 w-3" />
                QR Codes
              </TabsTrigger>
              {/* Show Whatsapp Settings tab only for role_id=1 (Admin) */}
              {currentUser?.role_id === 1 && (
                <TabsTrigger value="notification-settings" className="min-w-fit px-3 py-2 data-[state=active]:bg-purple-100 data-[state=active]:text-purple-900 data-[state=active]:shadow-sm flex items-center gap-1 text-xs">
                  <MessageCircle className="h-3 w-3" />
                  Whatsapp
                </TabsTrigger>
              )}
              {/* Show SMS Settings tab only for role_id=1 (Admin) */}
              {currentUser?.role_id === 1 && (
                <TabsTrigger value="sms-settings" className="min-w-fit px-3 py-2 data-[state=active]:bg-purple-100 data-[state=active]:text-purple-900 data-[state=active]:shadow-sm flex items-center gap-1 text-xs">
                  <MessageCircle className="h-3 w-3" />
                  SMS
                </TabsTrigger>
              )}
              {/* Show Telegram Settings tab only for role_id=1 (Admin) */}
              {currentUser?.role_id === 1 && (
                <TabsTrigger value="telegram-notifications" className="min-w-fit px-3 py-2 data-[state=active]:bg-purple-100 data-[state=active]:text-purple-900 data-[state=active]:shadow-sm flex items-center gap-1 text-xs">
                  <Send className="h-3 w-3" />
                  Telegram
                </TabsTrigger>
              )}
            </TabsList>

            <div className="flex-1">{/* Content wrapper */}
            
            <TabsContent value="users" className="mt-1.5">
              <div className="space-y-4">
                <div className="mb-6">
                  <h3 className="text-xl font-semibold text-gray-900">User Settings</h3>
                  <p className="text-sm text-gray-500 mt-1">Manage system users, their roles and permissions</p>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs sm:text-sm text-gray-600">Rows per page:</span>
                      <Select value={perPage} onValueChange={(value) => { setPerPage(value); setCurrentPage(1); }}>
                        <SelectTrigger className="w-[60px] sm:w-[70px] h-7 sm:h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="10">10</SelectItem>
                          <SelectItem value="25">25</SelectItem>
                          <SelectItem value="50">50</SelectItem>
                          <SelectItem value="100">100</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    {currentUser?.role_id === 1 && (
                      <div className="flex items-center space-x-2">
                        <span className="text-xs sm:text-sm text-gray-600">Branch:</span>
                        <Select value={selectedBranchFilter || 'all'} onValueChange={(value) => { setSelectedBranchFilter(value === 'all' ? '' : value); setCurrentPage(1); }}>
                          <SelectTrigger className="w-[120px] sm:w-[150px] h-7 sm:h-8">
                            <SelectValue placeholder="All Branches" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Branches</SelectItem>
                            {branches.map((branch) => (
                              <SelectItem key={branch.id} value={branch.id.toString()}>
                                {branch.branch_name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:space-x-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-3 sm:h-4 w-3 sm:w-4 text-gray-400" />
                      <Input
                        placeholder="Search users..."
                        value={searchTerm}
                        onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                        className="pl-8 sm:pl-9 pr-3 h-8 sm:h-9 w-full sm:w-[300px] text-sm"
                      />
                    </div>
                    <Button 
                      className="bg-black hover:bg-gray-800 text-white text-xs sm:text-sm h-8 sm:h-9 w-full sm:w-auto" 
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleAdd();
                      }}
                      type="button"
                    >
                      <Plus className="mr-1 sm:mr-2 h-3 sm:h-4 w-3 sm:w-4" />
                      Add User
                    </Button>
                  </div>
                </div>

                {/* Desktop Table View */}
                <div className="hidden md:block overflow-x-auto border border-[#e4e4e4] rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50 border-b border-[#e4e4e4]">
                        <TableHead className="font-semibold text-gray-700 py-3">Sl No</TableHead>
                        <TableHead className="font-semibold text-gray-700 py-3">Name</TableHead>
                        <TableHead className="font-semibold text-gray-700 py-3">Email</TableHead>
                        <TableHead className="font-semibold text-gray-700 py-3">Department</TableHead>
                        <TableHead className="font-semibold text-gray-700 py-3">Designation</TableHead>
                        <TableHead className="font-semibold text-gray-700 py-3">Branch</TableHead>
                        <TableHead className="font-semibold text-gray-700 py-3">Role</TableHead>
                        <TableHead className="font-semibold text-gray-700 py-3">Status</TableHead>
                        <TableHead className="font-semibold text-gray-700 py-3">Created At</TableHead>
                        <TableHead className="font-semibold text-gray-700 py-3 text-center">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {loading ? (
                        <TableRow>
                          <TableCell colSpan={10} className="h-24 text-center">
                            <div className="flex items-center justify-center">
                              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : error ? (
                        <TableRow>
                          <TableCell colSpan={10} className="h-24 text-center">
                            <div className="text-destructive">Error: {error}</div>
                          </TableCell>
                        </TableRow>
                      ) : users.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={10} className="h-24 text-center">
                            No users found.
                          </TableCell>
                        </TableRow>
                      ) : (
                        users.map((user, index) => (
                          <TableRow key={user.id} className="hover:bg-gray-50 border-b border-[#e4e4e4] last:border-b-0">
                            <TableCell className="py-3">{((currentPage - 1) * parseInt(perPage)) + index + 1}</TableCell>
                            <TableCell className="py-3">{user.name}</TableCell>
                            <TableCell className="py-3">{user.email}</TableCell>
                            <TableCell className="py-3">
                              <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                {user.department?.department_name || '-'}
                              </span>
                            </TableCell>
                            <TableCell className="py-3">
                              <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                {user.designation?.designation_name || '-'}
                              </span>
                            </TableCell>
                            <TableCell className="py-3">
                              <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                {user.branch?.branch_name || '-'}
                              </span>
                            </TableCell>
                            <TableCell className="py-3">
                              <div className="flex items-center gap-2">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  (user.role_id || user.role) === 1 ? 'bg-purple-100 text-purple-800' :
                                  (user.role_id || user.role) === 3 ? 'bg-blue-100 text-blue-800' :
                                  (user.role_id || user.role) === 4 ? 'bg-orange-100 text-orange-800' :
                                  'bg-green-100 text-green-800'
                                }`}>
                                  {getRoleName(user.role_id || user.role)}
                                </span>
                                {(user.role_id || user.role) === 3 && (
                                  <>
                                    <button
                                      className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200 transition-colors cursor-pointer"
                                      onClick={() => handleViewAssignedAgents(user)}
                                      title="View Assigned Agents"
                                    >
                                      {user.assigned_agents_count || 0}
                                    </button>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-6 w-6"
                                      onClick={() => handleAssignAgents(user)}
                                      title="Assign Agents"
                                    >
                                      <UserPlus className="h-4 w-4 text-blue-600" />
                                    </Button>
                                  </>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="py-3">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                user.status === 1 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                              }`}>
                                {getStatusName(user.status)}
                              </span>
                            </TableCell>
                            <TableCell className="py-3">{new Date(user.created_at).toLocaleDateString()}</TableCell>
                            <TableCell className="py-3">
                              <div className="flex items-center justify-center space-x-1">
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-8 w-8"
                                  onClick={() => handleEdit(user)}
                                  title="Edit User"
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-8 w-8"
                                  onClick={() => handleChangePassword(user)}
                                  title="Change Password"
                                >
                                  <Lock className="h-4 w-4" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-8 w-8"
                                  onClick={() => handleDelete(user)}
                                  title="Delete User"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>

                {/* Mobile Card View */}
                <div className="block md:hidden space-y-3">
                  {loading ? (
                    <div className="flex items-center justify-center h-24">
                      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                    </div>
                  ) : error ? (
                    <div className="text-center text-destructive p-6">Error: {error}</div>
                  ) : users.length === 0 ? (
                    <div className="text-center text-gray-500 p-6">No users found.</div>
                  ) : (
                    users.map((user, index) => (
                      <div key={user.id} className="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
                        <div className="flex justify-between items-start">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-medium text-gray-500">#{((currentPage - 1) * parseInt(perPage)) + index + 1}</span>
                              <h4 className="font-semibold text-gray-900">{user.name}</h4>
                            </div>
                            <p className="text-sm text-gray-600">{user.email}</p>
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            user.status === 1 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {user.status === 1 ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="text-gray-500">Department:</span>
                            <p className="font-medium">{user.department?.department_name || '-'}</p>
                          </div>
                          <div>
                            <span className="text-gray-500">Designation:</span>
                            <p className="font-medium">{user.designation?.designation_name || '-'}</p>
                          </div>
                          <div>
                            <span className="text-gray-500">Branch:</span>
                            <p className="font-medium">{user.branch?.branch_name || '-'}</p>
                          </div>
                          <div>
                            <span className="text-gray-500">Role:</span>
                            <p className="font-medium">
                              {getRoleName(user.role_id || user.role)}
                            </p>
                          </div>
                          <div>
                            <span className="text-gray-500">Created:</span>
                            <p className="font-medium">
                              {new Date(user.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex gap-2 pt-2 border-t">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            onClick={() => handleEdit(user)}
                          >
                            <Edit className="h-3 w-3 mr-1" />
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            onClick={() => handleChangePassword(user)}
                          >
                            <Lock className="h-3 w-3 mr-1" />
                            Password
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(user)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="text-xs sm:text-sm text-gray-600 text-center sm:text-left">
                    Showing {users.length === 0 ? 0 : ((currentPage - 1) * parseInt(perPage)) + 1} to{' '}
                    {Math.min(currentPage * parseInt(perPage), totalItems)} of {totalItems} entries
                  </div>
                  <div className="flex items-center justify-center sm:justify-end space-x-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className="text-xs sm:text-sm"
                    >
                      Previous
                    </Button>
                    <div className="hidden sm:flex items-center gap-1">
                      {(() => {
                        const pages = [];
                        const maxVisiblePages = 5;
                        let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
                        let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

                        if (endPage - startPage < maxVisiblePages - 1) {
                          startPage = Math.max(1, endPage - maxVisiblePages + 1);
                        }

                        // First page
                        if (startPage > 1) {
                          pages.push(
                            <Button
                              key={1}
                              variant="outline"
                              size="sm"
                              onClick={() => setCurrentPage(1)}
                              disabled={loading}
                              className="w-9 h-9 p-0"
                            >
                              1
                            </Button>
                          );
                          if (startPage > 2) {
                            pages.push(<span key="start-ellipsis" className="px-2">...</span>);
                          }
                        }

                        // Page numbers
                        for (let i = startPage; i <= endPage; i++) {
                          pages.push(
                            <Button
                              key={i}
                              variant={i === currentPage ? "default" : "outline"}
                              size="sm"
                              onClick={() => setCurrentPage(i)}
                              disabled={loading}
                              className={`w-9 h-9 p-0 ${i === currentPage ? 'bg-blue-600 text-white hover:bg-blue-700' : ''}`}
                            >
                              {i}
                            </Button>
                          );
                        }

                        // Last page
                        if (endPage < totalPages) {
                          if (endPage < totalPages - 1) {
                            pages.push(<span key="end-ellipsis" className="px-2">...</span>);
                          }
                          pages.push(
                            <Button
                              key={totalPages}
                              variant="outline"
                              size="sm"
                              onClick={() => setCurrentPage(totalPages)}
                              disabled={loading}
                              className="w-9 h-9 p-0"
                            >
                              {totalPages}
                            </Button>
                          );
                        }

                        return pages;
                      })()}
                    </div>
                    <div className="flex sm:hidden items-center px-3 text-xs">
                      Page {currentPage} of {totalPages}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                      className="text-xs sm:text-sm"
                    >
                      Next
                    </Button>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="company-logo" className="mt-1.5">
              <div className="space-y-4">
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-900" style={{fontSize: '14px'}}>Logo & Favicon Management</h3>
                  <p className="text-sm text-gray-500 mt-1">Manage your company logos and favicons. You can have one active logo and one active favicon simultaneously.</p>
                </div>
                
                {/* Two-column layout */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                  
                  {/* Left Column - Add Logo Form (25% width) */}
                  <div className="lg:col-span-1">
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="logo-name" className="text-sm font-medium">Logo Name</Label>
                        <Input
                          id="logo-name"
                          type="text"
                          placeholder="Enter logo name (optional)"
                          value={logoFormData.name}
                          onChange={(e) => handleLogoFormChange('name', e.target.value)}
                          className="mt-1"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="logo-type" className="text-sm font-medium">Type</Label>
                        <Select
                          value={logoFormData.type}
                          onValueChange={(value: 'Logo' | 'Favicon') => handleLogoFormChange('type', value)}
                        >
                          <SelectTrigger className="mt-1">
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Logo">Logo</SelectItem>
                            <SelectItem value="Favicon">Favicon</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <Label htmlFor="logo-file" className="text-sm font-medium">Logo Image</Label>
                        <Input
                          id="logo-file"
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            handleLogoFormChange('logo_image', file || null);
                          }}
                          className="mt-1"
                        />
                        <p className="text-xs text-gray-500 mt-1">Max size: 2MB. Formats: JPG, PNG, GIF, SVG</p>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="logo-active"
                          checked={logoFormData.is_active}
                          onCheckedChange={(checked) => handleLogoFormChange('is_active', checked)}
                        />
                        <Label htmlFor="logo-active" className="text-sm">Set as Active Logo</Label>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">Note: Only one logo of each type can be active at a time. Setting this as active will deactivate all other logos of the same type.</p>

                      <Button
                        onClick={handleAddLogo}
                        disabled={savingLogo || !logoFormData.logo_image}
                        className="w-full bg-gray-800 hover:bg-gray-900"
                      >
                        {savingLogo ? 'Adding...' : 'Add Logo'}
                      </Button>
                    </div>
                  </div>

                  {/* Right Column - Logos Table (75% width) */}
                  <div className="lg:col-span-3">
                    {/* Controls */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs sm:text-sm text-gray-600">Rows per page:</span>
                        <Select value={perPageLogos.toString()} onValueChange={(value) => {
                          setPerPageLogos(parseInt(value));
                          setCurrentPageLogos(1);
                        }}>
                          <SelectTrigger className="w-[60px] sm:w-[70px] h-7 sm:h-8">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="10">10</SelectItem>
                            <SelectItem value="25">25</SelectItem>
                            <SelectItem value="50">50</SelectItem>
                            <SelectItem value="100">100</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-3 sm:h-4 w-3 sm:w-4 text-gray-400" />
                        <Input
                          placeholder="Search logos..."
                          value={searchTermLogos}
                          onChange={(e) => setSearchTermLogos(e.target.value)}
                          className="pl-8 sm:pl-9 pr-3 py-1.5 sm:py-2 h-7 sm:h-8 w-full sm:w-64 text-xs sm:text-sm"
                        />
                      </div>
                    </div>

                    {/* Table */}
                    <div className="border border-gray-200 rounded-lg overflow-hidden">
                      {loadingLogos ? (
                        <div className="text-center py-8">
                          <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-solid border-purple-600 border-r-transparent"></div>
                          <span className="ml-2 text-sm text-gray-600">Loading logos...</span>
                        </div>
                      ) : errorLogos ? (
                        <div className="text-center py-8">
                          <p className="text-red-500 text-sm">{errorLogos}</p>
                        </div>
                      ) : (
                        <Table>
                          <TableHeader className="bg-gray-50">
                            <TableRow>
                              <TableHead className="font-medium text-gray-600 px-4 py-3" style={{fontSize: '14px'}}>S.No</TableHead>
                              <TableHead className="font-medium text-gray-600 px-4 py-3" style={{fontSize: '14px'}}>Logo/Favicon</TableHead>
                              <TableHead className="font-medium text-gray-600 px-4 py-3" style={{fontSize: '14px'}}>Name</TableHead>
                              <TableHead className="font-medium text-gray-600 px-4 py-3" style={{fontSize: '14px'}}>Type</TableHead>
                              <TableHead className="font-medium text-gray-600 px-4 py-3" style={{fontSize: '14px'}}>Status</TableHead>
                              <TableHead className="font-medium text-gray-600 px-4 py-3" style={{fontSize: '14px'}}>Created By</TableHead>
                              <TableHead className="font-medium text-gray-600 px-4 py-3 text-right" style={{fontSize: '14px'}}>Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {companyLogos.length === 0 ? (
                              <TableRow>
                                <TableCell colSpan={7} className="text-center py-8 text-gray-500" style={{fontSize: '14px'}}>
                                  No company logos found
                                </TableCell>
                              </TableRow>
                            ) : (
                              companyLogos.map((logo, index) => (
                                <TableRow key={logo.id} className="hover:bg-gray-50">
                                  <TableCell className="px-4 py-3 text-gray-600" style={{fontSize: '14px'}}>
                                    {((currentPageLogos - 1) * perPageLogos) + index + 1}
                                  </TableCell>
                                  <TableCell className="px-4 py-3">
                                    {logo.logo_image ? (
                                      <img 
                                        src={`/${logo.logo_image}`} 
                                        alt={logo.name || 'Company Logo'} 
                                        className="w-[150px] h-auto max-h-16 object-contain rounded"
                                        style={{ width: '150px' }}
                                      />
                                    ) : (
                                      <div className="w-[150px] h-16 bg-gray-200 rounded flex items-center justify-center" style={{ width: '150px' }}>
                                        <Building2 className="h-8 w-8 text-gray-400" />
                                      </div>
                                    )}
                                  </TableCell>
                                  <TableCell className="px-4 py-3 text-gray-900" style={{fontSize: '14px'}}>
                                    {logo.name || '-'}
                                  </TableCell>
                                  <TableCell className="px-4 py-3 text-gray-600" style={{fontSize: '14px'}}>
                                    <span className={`inline-flex px-2 py-1 rounded-full ${
                                      logo.type === 'Favicon' 
                                        ? 'bg-purple-100 text-purple-800' 
                                        : 'bg-blue-100 text-blue-800'
                                    }`} style={{fontSize: '14px'}}>
                                      {logo.type || 'Logo'}
                                    </span>
                                  </TableCell>
                                  <TableCell className="px-4 py-3" style={{fontSize: '14px'}}>
                                    <span className={`inline-flex px-2 py-1 rounded-full ${
                                      logo.is_active 
                                        ? 'bg-green-100 text-green-800' 
                                        : 'bg-red-100 text-red-800'
                                    }`} style={{fontSize: '14px'}}>
                                      {logo.is_active ? 'Active' : 'Inactive'}
                                    </span>
                                  </TableCell>
                                  <TableCell className="px-4 py-3 text-gray-600" style={{fontSize: '14px'}}>
                                    {logo.creator?.name || '-'}
                                  </TableCell>
                                  <TableCell className="px-4 py-3 text-right">
                                    <div className="flex items-center justify-end space-x-2">
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => handleEditLogo(logo)}
                                        className="h-7 w-7 p-0"
                                      >
                                        <Edit className="h-3 w-3" />
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => handleDeleteLogo(logo)}
                                        className="h-7 w-7 p-0 text-red-500 hover:text-red-700"
                                      >
                                        <Trash2 className="h-3 w-3" />
                                      </Button>
                                    </div>
                                  </TableCell>
                                </TableRow>
                              ))
                            )}
                          </TableBody>
                        </Table>
                      )}
                    </div>

                    {/* Pagination */}
                    {totalPagesLogos > 1 && (
                      <div className="flex items-center justify-between mt-4">
                        <div className="text-sm text-gray-600">
                          Page {currentPageLogos} of {totalPagesLogos} ({totalLogos} total)
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setCurrentPageLogos(1)}
                            disabled={currentPageLogos === 1}
                            className="h-8 w-8 p-0"
                          >
                            <ChevronsLeft className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setCurrentPageLogos(currentPageLogos - 1)}
                            disabled={currentPageLogos === 1}
                            className="h-8 w-8 p-0"
                          >
                            <ChevronLeft className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setCurrentPageLogos(currentPageLogos + 1)}
                            disabled={currentPageLogos === totalPagesLogos}
                            className="h-8 w-8 p-0"
                          >
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setCurrentPageLogos(totalPagesLogos)}
                            disabled={currentPageLogos === totalPagesLogos}
                            className="h-8 w-8 p-0"
                          >
                            <ChevronsRight className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="roles" className="mt-1.5">
              <div className="space-y-4">
                <div className="mb-6">
                  <h3 className="text-xl font-semibold text-gray-900">Roles Management</h3>
                  <p className="text-sm text-gray-500 mt-1">Manage user roles and their permissions</p>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:gap-6">
                <div className="lg:col-span-1">
                  <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs sm:text-sm text-gray-600">Rows per page:</span>
                        <Select value={perPageRoles} onValueChange={(value) => { setPerPageRoles(value); setCurrentPageRoles(1); }}>
                          <SelectTrigger className="w-[60px] sm:w-[70px] h-7 sm:h-8">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="10">10</SelectItem>
                            <SelectItem value="25">25</SelectItem>
                            <SelectItem value="50">50</SelectItem>
                            <SelectItem value="100">100</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="relative flex-1 sm:flex-initial">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-3 sm:h-4 w-3 sm:w-4 text-gray-400" />
                        <Input
                          placeholder="Search roles..."
                          value={searchTermRoles}
                          onChange={(e) => { setSearchTermRoles(e.target.value); setCurrentPageRoles(1); }}
                          className="pl-8 sm:pl-9 pr-3 h-8 sm:h-9 w-full sm:w-[300px] text-sm"
                        />
                      </div>
                    </div>

                    <div className="overflow-x-auto border border-[#e4e4e4] rounded-lg">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-gray-50 border-b border-[#e4e4e4]">
                            <TableHead className="font-semibold text-gray-700 py-3">Sl No</TableHead>
                            <TableHead className="font-semibold text-gray-700 py-3">Name</TableHead>
                            <TableHead className="font-semibold text-gray-700 py-3">Type</TableHead>
                            <TableHead className="font-semibold text-gray-700 py-3">Description</TableHead>
                            <TableHead className="font-semibold text-gray-700 py-3">Users</TableHead>
                            <TableHead className="font-semibold text-gray-700 py-3">Created At</TableHead>
                            <TableHead className="font-semibold text-gray-700 py-3 text-center">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {loadingRoles ? (
                            <TableRow>
                              <TableCell colSpan={7} className="h-24 text-center">
                                <div className="flex items-center justify-center">
                                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                                </div>
                              </TableCell>
                            </TableRow>
                          ) : errorRoles ? (
                            <TableRow>
                              <TableCell colSpan={7} className="h-24 text-center">
                                <div className="text-destructive">Error: {errorRoles}</div>
                              </TableCell>
                            </TableRow>
                          ) : roles.length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={7} className="h-24 text-center">
                                No roles found.
                              </TableCell>
                            </TableRow>
                          ) : (
                            roles.map((role, index) => (
                              <TableRow key={role.id} className="hover:bg-gray-50 border-b border-[#e4e4e4] last:border-b-0">
                                <TableCell className="py-3">
                                  <span className="font-medium text-gray-700">
                                    {((currentPageRoles - 1) * parseInt(perPageRoles)) + index + 1}
                                  </span>
                                </TableCell>
                                <TableCell className="py-3">
                                  <span className={`font-medium ${
                                    role.id <= 4 ? 'text-gray-500' : ''
                                  }`}>
                                    {role.name}
                                  </span>
                                  {role.id <= 4 && (
                                    <span className="ml-2 text-xs text-gray-400">(System)</span>
                                  )}
                                </TableCell>
                                <TableCell className="py-3">
                                  <span className="font-medium text-gray-700">
                                    {getRoleName(role.id)}
                                  </span>
                                </TableCell>
                                <TableCell className="py-3">{role.description || '-'}</TableCell>
                                <TableCell className="py-3">
                                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                    {role.users_count || 0}
                                  </span>
                                </TableCell>
                                <TableCell className="py-3">{new Date(role.created_at).toLocaleDateString()}</TableCell>
                                <TableCell className="py-3">
                                  <div className="flex items-center justify-center space-x-1">
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8"
                                      onClick={() => handleEditRole(role)}
                                    >
                                      <Edit className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))
                          )}
                        </TableBody>
                      </Table>
                    </div>

                    {/* Mobile Card View for Roles */}
                    <div className="block md:hidden space-y-3">
                      {loadingRoles ? (
                        <div className="flex items-center justify-center h-24">
                          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                        </div>
                      ) : errorRoles ? (
                        <div className="text-center text-destructive p-6">Error: {errorRoles}</div>
                      ) : roles.length === 0 ? (
                        <div className="text-center text-gray-500 p-6">No roles found.</div>
                      ) : (
                        roles.map((role, index) => (
                          <div key={role.id} className="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
                            <div className="flex justify-between items-start">
                              <div>
                                <div className="text-xs text-gray-500 mb-1">
                                  #{((currentPageRoles - 1) * parseInt(perPageRoles)) + index + 1}
                                </div>
                                <h4 className="font-semibold text-gray-900">
                                  {role.name}
                                  {role.id <= 4 && (
                                    <span className="ml-2 text-xs text-gray-400">(System)</span>
                                  )}
                                </h4>
                                <p className="text-sm font-medium text-gray-700 mt-1">Type: {getRoleName(role.id)}</p>
                                <p className="text-sm text-gray-600 mt-1">{role.description || 'No description'}</p>
                              </div>
                              <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                {role.users_count || 0} users
                              </span>
                            </div>

                            <div className="text-sm text-gray-500">
                              Created: {new Date(role.created_at).toLocaleDateString()}
                            </div>

                            <div className="flex gap-2 pt-2 border-t">
                              <Button
                                variant="outline"
                                size="sm"
                                className="flex-1"
                                onClick={() => handleEditRole(role)}
                              >
                                <Edit className="h-3 w-3 mr-1" />
                                Edit
                              </Button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div className="text-xs sm:text-sm text-gray-600 text-center sm:text-left">
                        Showing {roles.length === 0 ? 0 : ((currentPageRoles - 1) * parseInt(perPageRoles)) + 1} to{' '}
                        {Math.min(currentPageRoles * parseInt(perPageRoles), totalItemsRoles)} of {totalItemsRoles} entries
                      </div>
                      <div className="flex items-center justify-center sm:justify-end space-x-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPageRoles(Math.max(1, currentPageRoles - 1))}
                          disabled={currentPageRoles === 1}
                          className="text-xs sm:text-sm"
                        >
                          Previous
                        </Button>
                        <div className="hidden sm:flex items-center space-x-1">
                        {Array.from({ length: Math.min(5, totalPagesRoles) }, (_, i) => {
                          let pageNum;
                          if (totalPagesRoles <= 5) {
                            pageNum = i + 1;
                          } else if (currentPageRoles <= 3) {
                            pageNum = i + 1;
                          } else if (currentPageRoles >= totalPagesRoles - 2) {
                            pageNum = totalPagesRoles - 4 + i;
                          } else {
                            pageNum = currentPageRoles - 2 + i;
                          }
                          return (
                            <Button
                              key={i}
                              variant={pageNum === currentPageRoles ? "default" : "outline"}
                              size="sm"
                              className={`h-8 w-8 ${pageNum === currentPageRoles ? 'bg-black text-white hover:bg-gray-800' : ''}`}
                              onClick={() => setCurrentPageRoles(pageNum)}
                            >
                              {pageNum}
                            </Button>
                          );
                        })}
                        </div>
                        <div className="flex sm:hidden items-center px-3 text-xs">
                          Page {currentPageRoles} of {totalPagesRoles}
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPageRoles(Math.min(totalPagesRoles, currentPageRoles + 1))}
                          disabled={currentPageRoles === totalPagesRoles}
                          className="text-xs sm:text-sm"
                        >
                          Next
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="branches" className="mt-1.5">
              <div className="space-y-4">
                <div className="mb-6">
                  <h3 className="text-xl font-semibold text-gray-900">Branches Management</h3>
                  <p className="text-sm text-gray-500 mt-1">Manage branch locations for ticket organization</p>
                </div>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6">
                  {/* First Column - 25% */}
                  <div className="lg:col-span-1">
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-900">Branch</h3>
                    <p className="text-sm text-gray-600">
                      Manage branches in your system. Create branches to organize tickets by location or division.
                    </p>
                    
                    {/* Add Branch Form */}
                    <div className="space-y-3">
                      <div>
                        <Label htmlFor="branch-name">Branch Name</Label>
                        <Input
                          id="branch-name"
                          placeholder="Enter branch name"
                          value={branchFormData.branch_name}
                          onChange={(e) => setBranchFormData({ ...branchFormData, branch_name: e.target.value })}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              handleAddBranch();
                            }
                          }}
                          disabled={savingBranch}
                          className="mt-1"
                        />
                      </div>

                      <div>
                        <Label htmlFor="branch-address">Address</Label>
                        <Textarea
                          id="branch-address"
                          placeholder="Enter branch address"
                          value={branchFormData.address}
                          onChange={(e) => setBranchFormData({ ...branchFormData, address: e.target.value })}
                          disabled={savingBranch}
                          className="mt-1 min-h-[80px]"
                        />
                      </div>

                      <div>
                        <Label htmlFor="branch-country-code">Country Code</Label>
                        <Select
                          value={branchFormData.country_code}
                          onValueChange={(value) => setBranchFormData({ ...branchFormData, country_code: value })}
                          disabled={savingBranch}
                        >
                          <SelectTrigger className="mt-1">
                            <SelectValue placeholder="Select country code" />
                          </SelectTrigger>
                          <SelectContent className="max-h-[300px]">
                            {COUNTRY_CODES.map((country) => (
                              <SelectItem key={country.code} value={country.code}>
                                <span className="flex items-center gap-2">
                                  <span>{country.flag}</span>
                                  <span>{country.name}</span>
                                  <span className="text-gray-500">({country.code})</span>
                                </span>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="branch-customer-care">Customer Care Number</Label>
                        <Input
                          id="branch-customer-care"
                          placeholder="Enter customer care number"
                          value={branchFormData.customer_care_number}
                          onChange={(e) => {
                            const value = e.target.value.replace(/[^0-9]/g, '');
                            if (value.length <= 15) {
                              setBranchFormData({ ...branchFormData, customer_care_number: value });
                            }
                          }}
                          disabled={savingBranch}
                          className="mt-1"
                          maxLength={15}
                        />
                      </div>
                      <Button 
                        onClick={handleAddBranch}
                        disabled={savingBranch || !branchFormData.branch_name.trim()}
                        className="w-full bg-black hover:bg-gray-800 text-white"
                      >
                        {savingBranch ? 'Adding...' : 'Add Branch'}
                      </Button>
                    </div>
                  </div>
                </div>
                
                {/* Second Column - 75% */}
                <div className="lg:col-span-3">
                  <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs sm:text-sm text-gray-600">Rows per page:</span>
                        <Select value={perPageBranches} onValueChange={(value) => { setPerPageBranches(value); setCurrentPageBranches(1); }}>
                          <SelectTrigger className="w-[60px] sm:w-[70px] h-7 sm:h-8">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="10">10</SelectItem>
                            <SelectItem value="25">25</SelectItem>
                            <SelectItem value="50">50</SelectItem>
                            <SelectItem value="100">100</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="relative flex-1 sm:flex-initial">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-3 sm:h-4 w-3 sm:w-4 text-gray-400" />
                        <Input
                          placeholder="Search branches..."
                          value={searchTermBranches}
                          onChange={(e) => { setSearchTermBranches(e.target.value); setCurrentPageBranches(1); }}
                          className="pl-8 sm:pl-9 pr-3 h-8 sm:h-9 w-full sm:w-[300px] text-sm"
                        />
                      </div>
                    </div>
                    <div className="overflow-x-auto border border-[#e4e4e4] rounded-lg">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-gray-50 border-b border-[#e4e4e4]">
                            <TableHead className="font-semibold text-gray-700 py-3">Sl No</TableHead>
                            <TableHead className="font-semibold text-gray-700 py-3">Branch Name</TableHead>
                            <TableHead className="font-semibold text-gray-700 py-3">Address</TableHead>
                            <TableHead className="font-semibold text-gray-700 py-3">Country Code</TableHead>
                            <TableHead className="font-semibold text-gray-700 py-3">Customer Care Number</TableHead>
                            <TableHead className="font-semibold text-gray-700 py-3">Created By</TableHead>
                            <TableHead className="font-semibold text-gray-700 py-3">Created At</TableHead>
                            <TableHead className="font-semibold text-gray-700 py-3 text-center">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {loadingBranches ? (
                            <TableRow>
                              <TableCell colSpan={8} className="h-24 text-center">
                                <div className="flex items-center justify-center">
                                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                                </div>
                              </TableCell>
                            </TableRow>
                          ) : errorBranches ? (
                            <TableRow>
                              <TableCell colSpan={8} className="h-24 text-center">
                                <div className="text-destructive">Error: {errorBranches}</div>
                              </TableCell>
                            </TableRow>
                          ) : branches.length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={8} className="h-24 text-center">
                                No branches found.
                              </TableCell>
                            </TableRow>
                          ) : (
                            branches.map((branch, index) => (
                              <TableRow key={branch.id} className="hover:bg-gray-50 border-b border-[#e4e4e4] last:border-b-0">
                                <TableCell className="py-3">{((currentPageBranches - 1) * parseInt(perPageBranches)) + index + 1}</TableCell>
                                <TableCell className="py-3">
                                  <span className="font-medium">{branch.branch_name}</span>
                                </TableCell>
                                <TableCell className="py-3">
                                  <span className="text-sm" title={branch.address || '-'}>
                                    {branch.address ? (branch.address.length > 30 ? branch.address.substring(0, 30) + '...' : branch.address) : '-'}
                                  </span>
                                </TableCell>
                                <TableCell className="py-3">{branch.country_code || '-'}</TableCell>
                                <TableCell className="py-3">{branch.customer_care_number || '-'}</TableCell>
                                <TableCell className="py-3">{branch.created_by?.name || '-'}</TableCell>
                                <TableCell className="py-3">{new Date(branch.created_at).toLocaleDateString()}</TableCell>
                                <TableCell className="py-3">
                                  <div className="flex items-center justify-center space-x-1">
                                    <Button 
                                      variant="ghost" 
                                      size="icon" 
                                      className="h-8 w-8"
                                      onClick={() => handleEditBranch(branch)}
                                    >
                                      <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button 
                                      variant="ghost" 
                                      size="icon" 
                                      className="h-8 w-8"
                                      onClick={() => handleDeleteBranch(branch)}
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))
                          )}
                        </TableBody>
                      </Table>
                    </div>
                    {/* Mobile Card View for Branches */}
                    <div className="block md:hidden space-y-3">
                      {loadingBranches ? (
                        <div className="flex items-center justify-center h-24">
                          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                        </div>
                      ) : errorBranches ? (
                        <div className="text-center text-destructive p-6">Error: {errorBranches}</div>
                      ) : branches.length === 0 ? (
                        <div className="text-center text-gray-500 p-6">No branches found.</div>
                      ) : (
                        branches.map((branch, index) => (
                          <div key={branch.id} className="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
                            <div className="flex justify-between items-start">
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-medium text-gray-500">#{((currentPageBranches - 1) * parseInt(perPageBranches)) + index + 1}</span>
                                  <h4 className="font-semibold text-gray-900">{branch.branch_name}</h4>
                                </div>
                                <p className="text-sm text-gray-600 mt-1">Created by {branch.created_by?.name || 'Unknown'}</p>
                              </div>
                            </div>

                            <div className="space-y-1">
                              <div className="text-sm text-gray-600">
                                <span className="font-medium">Address:</span> {branch.address || '-'}
                              </div>
                              <div className="text-sm text-gray-600">
                                <span className="font-medium">Country Code:</span> {branch.country_code || '-'}
                              </div>
                              <div className="text-sm text-gray-600">
                                <span className="font-medium">Customer Care:</span> {branch.customer_care_number || '-'}
                              </div>
                              <div className="text-sm text-gray-500">
                                <span className="font-medium">Created:</span> {new Date(branch.created_at).toLocaleDateString()}
                              </div>
                            </div>
                            
                            <div className="flex gap-2 pt-2 border-t">
                              <Button
                                variant="outline"
                                size="sm"
                                className="flex-1"
                                onClick={() => handleEditBranch(branch)}
                              >
                                <Edit className="h-3 w-3 mr-1" />
                                Edit
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDeleteBranch(branch)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="h-3 w-3 mr-1" />
                                Delete
                              </Button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div className="text-xs sm:text-sm text-gray-600 text-center sm:text-left">
                        Showing {branches.length === 0 ? 0 : ((currentPageBranches - 1) * parseInt(perPageBranches)) + 1} to{' '}
                        {Math.min(currentPageBranches * parseInt(perPageBranches), totalItemsBranches)} of {totalItemsBranches} entries
                      </div>
                      <div className="flex items-center justify-center sm:justify-end space-x-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPageBranches(Math.max(1, currentPageBranches - 1))}
                          disabled={currentPageBranches === 1}
                          className="text-xs sm:text-sm"
                        >
                          Previous
                        </Button>
                        <div className="hidden sm:flex items-center space-x-1">
                        {Array.from({ length: Math.min(5, totalPagesBranches) }, (_, i) => {
                          let pageNum;
                          if (totalPagesBranches <= 5) {
                            pageNum = i + 1;
                          } else if (currentPageBranches <= 3) {
                            pageNum = i + 1;
                          } else if (currentPageBranches >= totalPagesBranches - 2) {
                            pageNum = totalPagesBranches - 4 + i;
                          } else {
                            pageNum = currentPageBranches - 2 + i;
                          }
                          return (
                            <Button
                              key={i}
                              variant={pageNum === currentPageBranches ? "default" : "outline"}
                              size="sm"
                              className={`h-8 w-8 ${pageNum === currentPageBranches ? 'bg-black text-white hover:bg-gray-800' : ''}`}
                              onClick={() => setCurrentPageBranches(pageNum)}
                            >
                              {pageNum}
                            </Button>
                          );
                        })}
                        </div>
                        <div className="flex sm:hidden items-center px-3 text-xs">
                          Page {currentPageBranches} of {totalPagesBranches}
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPageBranches(Math.min(totalPagesBranches, currentPageBranches + 1))}
                          disabled={currentPageBranches === totalPagesBranches}
                          className="text-xs sm:text-sm"
                        >
                          Next
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="brands" className="mt-1.5">
              <div className="space-y-4">
                <div className="mb-6">
                  <h3 className="text-xl font-semibold text-gray-900">Brand Management</h3>
                  <p className="text-sm text-gray-500 mt-1">Manage product brands and their categories</p>
                </div>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6">
                  {/* First Column - 25% */}
                  <div className="lg:col-span-1">
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-900">Brand</h3>
                    <p className="text-sm text-gray-600">
                      Manage brands in your system. Create, edit, or delete brands that can be used for product categorization.
                    </p>
                    
                    {/* Add Brand Form */}
                    <div className="space-y-3">
                      <div>
                        <Label htmlFor="brand-name">Brand Name</Label>
                        <Input
                          id="brand-name"
                          placeholder="Enter brand name"
                          value={newBrandName}
                          onChange={(e) => setNewBrandName(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              handleAddBrand();
                            }
                          }}
                          disabled={savingBrand}
                          className="mt-1"
                        />
                      </div>
                      <Button 
                        onClick={handleAddBrand}
                        disabled={savingBrand || !newBrandName.trim()}
                        className="w-full bg-black hover:bg-gray-800 text-white"
                      >
                        {savingBrand ? 'Adding...' : 'Add Brand'}
                      </Button>
                    </div>
                  </div>
                </div>
                
                {/* Second Column - 75% */}
                <div className="lg:col-span-3">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-600">Rows per page:</span>
                        <Select value={perPageBrands.toString()} onValueChange={handlePerPageChangeBrands}>
                          <SelectTrigger className="w-[70px] h-8">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="10">10</SelectItem>
                            <SelectItem value="25">25</SelectItem>
                            <SelectItem value="50">50</SelectItem>
                            <SelectItem value="100">100</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          placeholder="Search brands..."
                          value={searchTermBrands}
                          onChange={(e) => handleSearchChangeBrands(e.target.value)}
                          className="pl-9 pr-3 h-9 w-[300px]"
                        />
                      </div>
                    </div>

                    {/* Desktop Table View */}
                    <div className="hidden md:block overflow-x-auto border border-[#e4e4e4] rounded-lg">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-gray-50 border-b border-[#e4e4e4]">
                            <TableHead className="font-semibold text-gray-700 py-3">S.No</TableHead>
                            <TableHead className="font-semibold text-gray-700 py-3">Brand Name</TableHead>
                            <TableHead className="font-semibold text-gray-700 py-3">Created At</TableHead>
                            <TableHead className="font-semibold text-gray-700 py-3 text-center">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {loadingBrands ? (
                            <TableRow>
                              <TableCell colSpan={4} className="h-24 text-center">
                                <div className="flex items-center justify-center">
                                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                                </div>
                              </TableCell>
                            </TableRow>
                          ) : errorBrands ? (
                            <TableRow>
                              <TableCell colSpan={4} className="h-24 text-center">
                                <div className="text-destructive">Error: {errorBrands}</div>
                              </TableCell>
                            </TableRow>
                          ) : filteredBrands.length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={4} className="h-24 text-center">
                                No brands found.
                              </TableCell>
                            </TableRow>
                          ) : (
                            (() => {
                              // Calculate pagination for brands
                              const totalPagesBrands = Math.ceil(filteredBrands.length / perPageBrands);
                              const startIndexBrands = (currentPageBrands - 1) * perPageBrands;
                              const endIndexBrands = startIndexBrands + perPageBrands;
                              const displayedBrands = filteredBrands.slice(startIndexBrands, endIndexBrands);

                              return displayedBrands.map((brand, index) => (
                                <TableRow key={brand.id} className="hover:bg-gray-50 border-b border-[#e4e4e4] last:border-b-0">
                                  <TableCell className="py-3">{startIndexBrands + index + 1}</TableCell>
                                  <TableCell className="py-3">{brand.brand}</TableCell>
                                  <TableCell className="py-3">{new Date(brand.created_at).toLocaleDateString()}</TableCell>
                                  <TableCell className="py-3">
                                    <div className="flex items-center justify-center space-x-1">
                                      <Button 
                                        variant="ghost" 
                                        size="icon" 
                                        className="h-8 w-8"
                                        onClick={() => handleEditBrand(brand)}
                                      >
                                        <Edit className="h-4 w-4" />
                                      </Button>
                                      <Button 
                                        variant="ghost" 
                                        size="icon" 
                                        className="h-8 w-8 text-red-600 hover:text-red-700"
                                        onClick={() => handleDeleteBrand(brand)}
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  </TableCell>
                                </TableRow>
                              ));
                            })()
                          )}
                        </TableBody>
                      </Table>
                    </div>

                    {/* Mobile Card View */}
                    <div className="block md:hidden space-y-3">
                      {loadingBrands ? (
                        <div className="flex items-center justify-center h-24">
                          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                        </div>
                      ) : errorBrands ? (
                        <div className="text-center text-destructive p-6">Error: {errorBrands}</div>
                      ) : filteredBrands.length === 0 ? (
                        <div className="text-center text-gray-500 p-6">No brands found.</div>
                      ) : (
                        (() => {
                          const startIndexBrands = (currentPageBrands - 1) * perPageBrands;
                          const endIndexBrands = startIndexBrands + perPageBrands;
                          const displayedBrands = filteredBrands.slice(startIndexBrands, endIndexBrands);

                          return displayedBrands.map((brand, index) => (
                            <div key={brand.id} className="bg-white border border-gray-200 rounded-lg p-4 space-y-2">
                              <div className="flex justify-between items-start">
                                <div>
                                  <span className="text-xs text-gray-500">#{startIndexBrands + index + 1}</span>
                                  <h4 className="font-semibold text-gray-900">{brand.brand}</h4>
                                </div>
                                <span className="text-xs text-gray-500">
                                  {new Date(brand.created_at).toLocaleDateString()}
                                </span>
                              </div>
                              
                              <div className="flex gap-2 pt-2 border-t">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="flex-1"
                                  onClick={() => handleEditBrand(brand)}
                                >
                                  <Edit className="h-3 w-3 mr-1" />
                                  Edit
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleDeleteBrand(brand)}
                                  className="text-red-600 hover:text-red-700"
                                >
                                  <Trash2 className="h-3 w-3 mr-1" />
                                  Delete
                                </Button>
                              </div>
                            </div>
                          ));
                        })()
                      )}
                    </div>

                    {!loadingBrands && filteredBrands.length > 0 && (
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div className="text-xs sm:text-sm text-gray-600 text-center sm:text-left">
                          {(() => {
                            const startIndexBrands = (currentPageBrands - 1) * perPageBrands;
                            const endIndexBrands = Math.min(startIndexBrands + perPageBrands, filteredBrands.length);
                            return `Showing ${startIndexBrands + 1} to ${endIndexBrands} of ${filteredBrands.length} entries`;
                          })()}
                          {searchTermBrands && ` (filtered from ${allBrands.length} total entries)`}
                        </div>
                        
                        <div className="flex items-center justify-center sm:justify-end space-x-1">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPageBrands(prev => Math.max(1, prev - 1))}
                            disabled={currentPageBrands === 1}
                            className="text-xs sm:text-sm text-gray-700"
                          >
                            Previous
                          </Button>
                          
                          <div className="hidden sm:flex items-center gap-1">
                            {(() => {
                              const totalPagesBrands = Math.ceil(filteredBrands.length / perPageBrands);
                              return Array.from({ length: Math.min(5, totalPagesBrands) }, (_, i) => {
                                let pageNum;
                                if (totalPagesBrands <= 5) {
                                  pageNum = i + 1;
                                } else if (currentPageBrands <= 3) {
                                  pageNum = i + 1;
                                } else if (currentPageBrands >= totalPagesBrands - 2) {
                                  pageNum = totalPagesBrands - 4 + i;
                                } else {
                                  pageNum = currentPageBrands - 2 + i;
                                }
                                
                                return pageNum > 0 && pageNum <= totalPagesBrands ? (
                                  <Button
                                    key={pageNum}
                                    variant={currentPageBrands === pageNum ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => setCurrentPageBrands(pageNum)}
                                    className={`h-8 w-8 ${
                                      currentPageBrands === pageNum 
                                        ? 'bg-black text-white hover:bg-gray-800' 
                                        : 'text-gray-700'
                                    }`}
                                  >
                                    {pageNum}
                                  </Button>
                                ) : null;
                              });
                            })()}
                          </div>
                          
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPageBrands(prev => {
                              const totalPagesBrands = Math.ceil(filteredBrands.length / perPageBrands);
                              return Math.min(totalPagesBrands, prev + 1);
                            })}
                            disabled={currentPageBrands === Math.ceil(filteredBrands.length / perPageBrands)}
                            className="text-xs sm:text-sm text-gray-700"
                          >
                            Next
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="categories" className="mt-1.5">
              <div className="space-y-4">
                <div className="mb-6">
                  <h3 className="text-xl font-semibold text-gray-900">Category Management</h3>
                  <p className="text-sm text-gray-500 mt-1">Organize products by categories under brands</p>
                </div>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6">
                  {/* First Column - 25% */}
                  <div className="lg:col-span-1">
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-900">Category</h3>
                    <p className="text-sm text-gray-600">
                      Manage categories in your system. Categories are organized under brands. Select a brand first, then add the category name.
                    </p>
                    
                    {/* Add Category Form */}
                    <div className="space-y-3">
                      <div>
                        <Label htmlFor="category-brand">Brand</Label>
                        <Select 
                          value={newCategoryBrandId} 
                          onValueChange={(value) => setNewCategoryBrandId(value)}
                          disabled={savingCategory}
                        >
                          <SelectTrigger className="mt-1">
                            <SelectValue placeholder="Select brand" />
                          </SelectTrigger>
                          <SelectContent>
                            {allBrands.map((brand) => (
                              <SelectItem key={brand.id} value={brand.id.toString()}>
                                {brand.brand}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="category-name">Category Name</Label>
                        <Input
                          id="category-name"
                          placeholder="Enter category name"
                          value={newCategoryName}
                          onChange={(e) => setNewCategoryName(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              handleAddCategory();
                            }
                          }}
                          disabled={savingCategory}
                          className="mt-1"
                        />
                      </div>
                      <Button 
                        onClick={handleAddCategory}
                        disabled={savingCategory || !newCategoryName.trim() || !newCategoryBrandId}
                        className="w-full bg-black hover:bg-gray-800 text-white"
                      >
                        {savingCategory ? 'Adding...' : 'Add Category'}
                      </Button>
                    </div>
                  </div>
                </div>
                
                {/* Second Column - 75% */}
                <div className="lg:col-span-3">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-600">Rows per page:</span>
                        <Select value={perPageCategories.toString()} onValueChange={handlePerPageChangeCategories}>
                          <SelectTrigger className="w-[70px] h-8">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="10">10</SelectItem>
                            <SelectItem value="25">25</SelectItem>
                            <SelectItem value="50">50</SelectItem>
                            <SelectItem value="100">100</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          placeholder="Search categories or brands..."
                          value={searchTermCategories}
                          onChange={(e) => handleSearchChangeCategories(e.target.value)}
                          className="pl-9 pr-3 h-9 w-[300px]"
                        />
                      </div>
                    </div>

                    <div className="overflow-x-auto border border-[#e4e4e4] rounded-lg">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-gray-50 border-b border-[#e4e4e4]">
                            <TableHead className="font-semibold text-gray-700 py-3">S.No</TableHead>
                            <TableHead className="font-semibold text-gray-700 py-3">Category Name</TableHead>
                            <TableHead className="font-semibold text-gray-700 py-3">Brand</TableHead>
                            <TableHead className="font-semibold text-gray-700 py-3">Created At</TableHead>
                            <TableHead className="font-semibold text-gray-700 py-3 text-center">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {loadingCategories ? (
                            <TableRow>
                              <TableCell colSpan={5} className="h-24 text-center">
                                <div className="flex items-center justify-center">
                                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                                </div>
                              </TableCell>
                            </TableRow>
                          ) : errorCategories ? (
                            <TableRow>
                              <TableCell colSpan={5} className="h-24 text-center">
                                <div className="text-destructive">Error: {errorCategories}</div>
                              </TableCell>
                            </TableRow>
                          ) : filteredCategories.length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={5} className="h-24 text-center">
                                No categories found.
                              </TableCell>
                            </TableRow>
                          ) : (
                            (() => {
                              // Calculate pagination for categories
                              const totalPagesCategories = Math.ceil(filteredCategories.length / perPageCategories);
                              const startIndexCategories = (currentPageCategories - 1) * perPageCategories;
                              const endIndexCategories = startIndexCategories + perPageCategories;
                              const displayedCategories = filteredCategories.slice(startIndexCategories, endIndexCategories);

                              return displayedCategories.map((category, index) => (
                                <TableRow key={category.id} className="hover:bg-gray-50 border-b border-[#e4e4e4] last:border-b-0">
                                  <TableCell className="py-3">{startIndexCategories + index + 1}</TableCell>
                                  <TableCell className="py-3">{category.category}</TableCell>
                                  <TableCell className="py-3">
                                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                      {category.brand?.brand || 'N/A'}
                                    </span>
                                  </TableCell>
                                  <TableCell className="py-3">{new Date(category.created_at).toLocaleDateString()}</TableCell>
                                  <TableCell className="py-3">
                                    <div className="flex items-center justify-center space-x-1">
                                      <Button 
                                        variant="ghost" 
                                        size="icon" 
                                        className="h-8 w-8"
                                        onClick={() => handleEditCategory(category)}
                                      >
                                        <Edit className="h-4 w-4" />
                                      </Button>
                                      <Button 
                                        variant="ghost" 
                                        size="icon" 
                                        className="h-8 w-8 text-red-600 hover:text-red-700"
                                        onClick={() => handleDeleteCategory(category)}
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  </TableCell>
                                </TableRow>
                              ));
                            })()
                          )}
                        </TableBody>
                      </Table>
                    </div>

                    {!loadingCategories && filteredCategories.length > 0 && (
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-600">
                          {(() => {
                            const startIndexCategories = (currentPageCategories - 1) * perPageCategories;
                            const endIndexCategories = Math.min(startIndexCategories + perPageCategories, filteredCategories.length);
                            return `Showing ${startIndexCategories + 1} to ${endIndexCategories} of ${filteredCategories.length} entries`;
                          })()}
                          {searchTermCategories && ` (filtered from ${allCategories.length} total entries)`}
                        </div>
                        
                        <div className="flex items-center justify-center sm:justify-end space-x-1">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPageCategories(prev => Math.max(1, prev - 1))}
                            disabled={currentPageCategories === 1}
                            className="text-xs sm:text-sm text-gray-700"
                          >
                            Previous
                          </Button>
                          
                          <div className="hidden sm:flex items-center gap-1">
                            {(() => {
                              const totalPagesCategories = Math.ceil(filteredCategories.length / perPageCategories);
                              return Array.from({ length: Math.min(5, totalPagesCategories) }, (_, i) => {
                                let pageNum;
                                if (totalPagesCategories <= 5) {
                                  pageNum = i + 1;
                                } else if (currentPageCategories <= 3) {
                                  pageNum = i + 1;
                                } else if (currentPageCategories >= totalPagesCategories - 2) {
                                  pageNum = totalPagesCategories - 4 + i;
                                } else {
                                  pageNum = currentPageCategories - 2 + i;
                                }
                                
                                return pageNum > 0 && pageNum <= totalPagesCategories ? (
                                  <Button
                                    key={pageNum}
                                    variant={currentPageCategories === pageNum ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => setCurrentPageCategories(pageNum)}
                                    className={`h-8 w-8 ${
                                      currentPageCategories === pageNum 
                                        ? 'bg-black text-white hover:bg-gray-800' 
                                        : 'text-gray-700'
                                    }`}
                                  >
                                    {pageNum}
                                  </Button>
                                ) : null;
                              });
                            })()}
                          </div>
                          
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPageCategories(prev => {
                              const totalPagesCategories = Math.ceil(filteredCategories.length / perPageCategories);
                              return Math.min(totalPagesCategories, prev + 1);
                            })}
                            disabled={currentPageCategories === Math.ceil(filteredCategories.length / perPageCategories)}
                            className="text-xs sm:text-sm text-gray-700"
                          >
                            Next
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="departments" className="mt-1.5">
              <div className="space-y-4">
                <div className="mb-6">
                  <h3 className="text-xl font-semibold text-gray-900">Department Management</h3>
                  <p className="text-sm text-gray-500 mt-1">Manage organizational departments and divisions</p>
                </div>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6">
                  {/* First Column - 25% */}
                  <div className="lg:col-span-1">
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-900">Department</h3>
                    <p className="text-sm text-gray-600">
                      Manage departments in your system. Create, edit, or delete departments for organizing agents.
                    </p>
                    
                    {/* Add Department Form */}
                    <div className="space-y-3">
                      <div>
                        <Label htmlFor="department-name">Department Name</Label>
                        <Input
                          id="department-name"
                          placeholder="Enter department name"
                          value={newDepartmentName}
                          onChange={(e) => setNewDepartmentName(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              handleAddDepartment();
                            }
                          }}
                          disabled={savingDepartment}
                          className="mt-1"
                        />
                      </div>
                      <Button 
                        onClick={handleAddDepartment}
                        disabled={savingDepartment || !newDepartmentName.trim()}
                        className="w-full bg-black hover:bg-gray-800 text-white"
                      >
                        {savingDepartment ? 'Adding...' : 'Add Department'}
                      </Button>
                    </div>
                  </div>
                </div>
                
                {/* Second Column - 75% */}
                <div className="lg:col-span-3">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-600">Rows per page:</span>
                        <Select value={perPageDepartments.toString()} onValueChange={handlePerPageChangeDepartments}>
                          <SelectTrigger className="w-[70px] h-8">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="10">10</SelectItem>
                            <SelectItem value="25">25</SelectItem>
                            <SelectItem value="50">50</SelectItem>
                            <SelectItem value="100">100</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          placeholder="Search departments..."
                          value={searchTermDepartments}
                          onChange={(e) => handleSearchChangeDepartments(e.target.value)}
                          className="pl-9 pr-3 h-9 w-[300px]"
                        />
                      </div>
                    </div>

                    <div className="overflow-x-auto border border-[#e4e4e4] rounded-lg">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-gray-50 border-b border-[#e4e4e4]">
                            <TableHead className="font-semibold text-gray-700 py-3">S.No</TableHead>
                            <TableHead className="font-semibold text-gray-700 py-3">Department Name</TableHead>
                            <TableHead className="font-semibold text-gray-700 py-3">Created By</TableHead>
                            <TableHead className="font-semibold text-gray-700 py-3 text-center">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {loadingDepartments ? (
                            <TableRow>
                              <TableCell colSpan={4} className="h-24 text-center">
                                <div className="flex items-center justify-center">
                                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                                </div>
                              </TableCell>
                            </TableRow>
                          ) : errorDepartments ? (
                            <TableRow>
                              <TableCell colSpan={4} className="h-24 text-center">
                                <div className="text-destructive">Error: {errorDepartments}</div>
                              </TableCell>
                            </TableRow>
                          ) : filteredDepartments.length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={4} className="h-24 text-center">
                                No departments found.
                              </TableCell>
                            </TableRow>
                          ) : (
                            (() => {
                              // Calculate pagination for departments
                              const totalPagesDepartments = Math.ceil(filteredDepartments.length / perPageDepartments);
                              const startIndexDepartments = (currentPageDepartments - 1) * perPageDepartments;
                              const endIndexDepartments = startIndexDepartments + perPageDepartments;
                              const displayedDepartments = filteredDepartments.slice(startIndexDepartments, endIndexDepartments);

                              return displayedDepartments.map((department, index) => (
                                <TableRow key={department.id} className="hover:bg-gray-50 border-b border-[#e4e4e4] last:border-b-0">
                                  <TableCell className="py-3">{startIndexDepartments + index + 1}</TableCell>
                                  <TableCell className="py-3">{department.department_name}</TableCell>
                                  <TableCell className="py-3">
                                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                      {department.creator?.name || 'Unknown'}
                                    </span>
                                  </TableCell>
                                  <TableCell className="py-3">
                                    <div className="flex items-center justify-center space-x-1">
                                      <Button 
                                        variant="ghost" 
                                        size="icon" 
                                        className="h-8 w-8"
                                        onClick={() => handleEditDepartment(department)}
                                      >
                                        <Edit className="h-4 w-4" />
                                      </Button>
                                      <Button 
                                        variant="ghost" 
                                        size="icon" 
                                        className="h-8 w-8 text-red-600 hover:text-red-700"
                                        onClick={() => handleDeleteDepartment(department)}
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  </TableCell>
                                </TableRow>
                              ));
                            })()
                          )}
                        </TableBody>
                      </Table>
                    </div>

                    {!loadingDepartments && filteredDepartments.length > 0 && (
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-600">
                          {(() => {
                            const startIndexDepartments = (currentPageDepartments - 1) * perPageDepartments;
                            const endIndexDepartments = Math.min(startIndexDepartments + perPageDepartments, filteredDepartments.length);
                            return `Showing ${startIndexDepartments + 1} to ${endIndexDepartments} of ${filteredDepartments.length} entries`;
                          })()}
                          {searchTermDepartments && ` (filtered from ${allDepartments.length} total entries)`}
                        </div>
                        
                        <div className="flex items-center justify-center sm:justify-end space-x-1">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPageDepartments(prev => Math.max(1, prev - 1))}
                            disabled={currentPageDepartments === 1}
                            className="text-xs sm:text-sm text-gray-700"
                          >
                            Previous
                          </Button>
                          
                          <div className="hidden sm:flex items-center gap-1">
                            {(() => {
                              const totalPagesDepartments = Math.ceil(filteredDepartments.length / perPageDepartments);
                              return Array.from({ length: Math.min(5, totalPagesDepartments) }, (_, i) => {
                                let pageNum;
                                if (totalPagesDepartments <= 5) {
                                  pageNum = i + 1;
                                } else if (currentPageDepartments <= 3) {
                                  pageNum = i + 1;
                                } else if (currentPageDepartments >= totalPagesDepartments - 2) {
                                  pageNum = totalPagesDepartments - 4 + i;
                                } else {
                                  pageNum = currentPageDepartments - 2 + i;
                                }
                                
                                return pageNum > 0 && pageNum <= totalPagesDepartments ? (
                                  <Button
                                    key={pageNum}
                                    variant={currentPageDepartments === pageNum ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => setCurrentPageDepartments(pageNum)}
                                    className={`h-8 w-8 ${
                                      currentPageDepartments === pageNum 
                                        ? 'bg-black text-white hover:bg-gray-800' 
                                        : 'text-gray-700'
                                    }`}
                                  >
                                    {pageNum}
                                  </Button>
                                ) : null;
                              });
                            })()}
                          </div>
                          
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPageDepartments(prev => {
                              const totalPagesDepartments = Math.ceil(filteredDepartments.length / perPageDepartments);
                              return Math.min(totalPagesDepartments, prev + 1);
                            })}
                            disabled={currentPageDepartments === Math.ceil(filteredDepartments.length / perPageDepartments)}
                            className="text-xs sm:text-sm text-gray-700"
                          >
                            Next
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="designations" className="mt-1.5">
              <div className="space-y-4">
                <div className="mb-6">
                  <h3 className="text-xl font-semibold text-gray-900">Designation Management</h3>
                  <p className="text-sm text-gray-500 mt-1">Define job titles and positions within departments</p>
                </div>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6">
                  {/* First Column - 25% */}
                  <div className="lg:col-span-1">
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-900">Designation</h3>
                    <p className="text-sm text-gray-600">
                      Manage designations in your system. Create, edit, or delete job titles and positions.
                    </p>
                    
                    {/* Add Designation Form */}
                    <div className="space-y-3">
                      <div>
                        <Label htmlFor="designation-name">Designation Name</Label>
                        <Input
                          id="designation-name"
                          placeholder="Enter designation name"
                          value={newDesignationName}
                          onChange={(e) => setNewDesignationName(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              handleAddDesignation();
                            }
                          }}
                          disabled={savingDesignation}
                          className="mt-1"
                        />
                      </div>
                      <Button 
                        onClick={handleAddDesignation}
                        disabled={savingDesignation || !newDesignationName.trim()}
                        className="w-full bg-black hover:bg-gray-800 text-white"
                      >
                        {savingDesignation ? 'Adding...' : 'Add Designation'}
                      </Button>
                    </div>
                  </div>
                </div>
                
                {/* Second Column - 75% */}
                <div className="lg:col-span-3">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-600">Rows per page:</span>
                        <Select value={perPageDesignations.toString()} onValueChange={handlePerPageChangeDesignations}>
                          <SelectTrigger className="w-[70px] h-8">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="10">10</SelectItem>
                            <SelectItem value="25">25</SelectItem>
                            <SelectItem value="50">50</SelectItem>
                            <SelectItem value="100">100</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          placeholder="Search designations..."
                          value={searchTermDesignations}
                          onChange={(e) => handleSearchChangeDesignations(e.target.value)}
                          className="pl-9 pr-3 h-9 w-[300px]"
                        />
                      </div>
                    </div>

                    <div className="overflow-x-auto border border-[#e4e4e4] rounded-lg">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-gray-50 border-b border-[#e4e4e4]">
                            <TableHead className="font-semibold text-gray-700 py-3">S.No</TableHead>
                            <TableHead className="font-semibold text-gray-700 py-3">Designation Name</TableHead>
                            <TableHead className="font-semibold text-gray-700 py-3">Created By</TableHead>
                            <TableHead className="font-semibold text-gray-700 py-3 text-center">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {loadingDesignations ? (
                            <TableRow>
                              <TableCell colSpan={4} className="h-24 text-center">
                                <div className="flex items-center justify-center">
                                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                                </div>
                              </TableCell>
                            </TableRow>
                          ) : errorDesignations ? (
                            <TableRow>
                              <TableCell colSpan={4} className="h-24 text-center">
                                <div className="text-destructive">Error: {errorDesignations}</div>
                              </TableCell>
                            </TableRow>
                          ) : filteredDesignations.length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={4} className="h-24 text-center">
                                No designations found.
                              </TableCell>
                            </TableRow>
                          ) : (
                            (() => {
                              // Calculate pagination for designations
                              const totalPagesDesignations = Math.ceil(filteredDesignations.length / perPageDesignations);
                              const startIndexDesignations = (currentPageDesignations - 1) * perPageDesignations;
                              const endIndexDesignations = startIndexDesignations + perPageDesignations;
                              const displayedDesignations = filteredDesignations.slice(startIndexDesignations, endIndexDesignations);

                              return displayedDesignations.map((designation, index) => (
                                <TableRow key={designation.id} className="hover:bg-gray-50 border-b border-[#e4e4e4] last:border-b-0">
                                  <TableCell className="py-3">{startIndexDesignations + index + 1}</TableCell>
                                  <TableCell className="py-3">{designation.designation_name}</TableCell>
                                  <TableCell className="py-3">
                                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                      {designation.creator?.name || 'Unknown'}
                                    </span>
                                  </TableCell>
                                  <TableCell className="py-3">
                                    <div className="flex items-center justify-center space-x-1">
                                      <Button 
                                        variant="ghost" 
                                        size="icon" 
                                        className="h-8 w-8"
                                        onClick={() => handleEditDesignation(designation)}
                                      >
                                        <Edit className="h-4 w-4" />
                                      </Button>
                                      <Button 
                                        variant="ghost" 
                                        size="icon" 
                                        className="h-8 w-8 text-red-600 hover:text-red-700"
                                        onClick={() => handleDeleteDesignation(designation)}
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  </TableCell>
                                </TableRow>
                              ));
                            })()
                          )}
                        </TableBody>
                      </Table>
                    </div>

                    {!loadingDesignations && filteredDesignations.length > 0 && (
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-600">
                          {(() => {
                            const startIndexDesignations = (currentPageDesignations - 1) * perPageDesignations;
                            const endIndexDesignations = Math.min(startIndexDesignations + perPageDesignations, filteredDesignations.length);
                            return `Showing ${startIndexDesignations + 1} to ${endIndexDesignations} of ${filteredDesignations.length} entries`;
                          })()}
                          {searchTermDesignations && ` (filtered from ${allDesignations.length} total entries)`}
                        </div>
                        
                        <div className="flex items-center justify-center sm:justify-end space-x-1">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPageDesignations(prev => Math.max(1, prev - 1))}
                            disabled={currentPageDesignations === 1}
                            className="text-xs sm:text-sm text-gray-700"
                          >
                            Previous
                          </Button>
                          
                          <div className="hidden sm:flex items-center gap-1">
                            {(() => {
                              const totalPagesDesignations = Math.ceil(filteredDesignations.length / perPageDesignations);
                              return Array.from({ length: Math.min(5, totalPagesDesignations) }, (_, i) => {
                                let pageNum;
                                if (totalPagesDesignations <= 5) {
                                  pageNum = i + 1;
                                } else if (currentPageDesignations <= 3) {
                                  pageNum = i + 1;
                                } else if (currentPageDesignations >= totalPagesDesignations - 2) {
                                  pageNum = totalPagesDesignations - 4 + i;
                                } else {
                                  pageNum = currentPageDesignations - 2 + i;
                                }
                                
                                return pageNum > 0 && pageNum <= totalPagesDesignations ? (
                                  <Button
                                    key={pageNum}
                                    variant={currentPageDesignations === pageNum ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => setCurrentPageDesignations(pageNum)}
                                    className={`h-8 w-8 ${
                                      currentPageDesignations === pageNum 
                                        ? 'bg-black text-white hover:bg-gray-800' 
                                        : 'text-gray-700'
                                    }`}
                                  >
                                    {pageNum}
                                  </Button>
                                ) : null;
                              });
                            })()}
                          </div>
                          
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPageDesignations(prev => {
                              const totalPagesDesignations = Math.ceil(filteredDesignations.length / perPageDesignations);
                              return Math.min(totalPagesDesignations, prev + 1);
                            })}
                            disabled={currentPageDesignations === Math.ceil(filteredDesignations.length / perPageDesignations)}
                            className="text-xs sm:text-sm text-gray-700"
                          >
                            Next
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="ticket-labels" className="mt-1.5">
              <div className="space-y-4">
                <div className="mb-6">
                  <h3 className="text-xl font-semibold text-gray-900">Ticket Labels</h3>
                  <p className="text-sm text-gray-500 mt-1">Create and manage color-coded labels for ticket categorization</p>
                </div>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6">
                  {/* First Column - 25% */}
                  <div className="lg:col-span-1">
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-900">Ticket Labels</h3>
                    <p className="text-sm text-gray-600">
                      Manage ticket labels in your system. Create, edit, or delete labels with custom colors for categorizing tickets.
                    </p>
                    
                    {/* Add Ticket Label Form */}
                    <div className="space-y-3">
                      <div>
                        <Label htmlFor="ticket-label-name">Label Name</Label>
                        <Input
                          id="ticket-label-name"
                          placeholder="Enter label name"
                          value={newTicketLabelName}
                          onChange={(e) => setNewTicketLabelName(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              handleAddTicketLabel();
                            }
                          }}
                          disabled={savingTicketLabel}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="ticket-label-color">Label Color</Label>
                        <Input
                          id="ticket-label-color"
                          type="color"
                          value={newTicketLabelColor}
                          onChange={(e) => setNewTicketLabelColor(e.target.value)}
                          disabled={savingTicketLabel}
                          className="mt-1 w-full h-10 cursor-pointer"
                        />
                      </div>
                      <Button 
                        onClick={handleAddTicketLabel}
                        disabled={savingTicketLabel || !newTicketLabelName.trim()}
                        className="w-full bg-black hover:bg-gray-800 text-white"
                      >
                        {savingTicketLabel ? 'Adding...' : 'Add Ticket Label'}
                      </Button>
                    </div>
                  </div>
                </div>
                
                {/* Second Column - 75% */}
                <div className="lg:col-span-3">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-600">Rows per page:</span>
                        <Select value={perPageTicketLabels.toString()} onValueChange={handlePerPageChangeTicketLabels}>
                          <SelectTrigger className="w-[70px] h-8">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="10">10</SelectItem>
                            <SelectItem value="25">25</SelectItem>
                            <SelectItem value="50">50</SelectItem>
                            <SelectItem value="100">100</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          placeholder="Search ticket labels..."
                          value={searchTermTicketLabels}
                          onChange={(e) => handleSearchChangeTicketLabels(e.target.value)}
                          className="pl-9 pr-3 h-9 w-[300px]"
                        />
                      </div>
                    </div>
                    <div className="overflow-x-auto border border-[#e4e4e4] rounded-lg">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-gray-50 border-b border-[#e4e4e4]">
                            <TableHead className="font-semibold text-gray-700 py-3">S.No</TableHead>
                            <TableHead className="font-semibold text-gray-700 py-3">Label Name</TableHead>
                            <TableHead className="font-semibold text-gray-700 py-3">Color</TableHead>
                            <TableHead className="font-semibold text-gray-700 py-3">Created By</TableHead>
                            <TableHead className="font-semibold text-gray-700 py-3 text-center">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {loadingTicketLabels ? (
                            <TableRow>
                              <TableCell colSpan={5} className="h-24 text-center">
                                <div className="flex items-center justify-center">
                                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                                </div>
                              </TableCell>
                            </TableRow>
                          ) : errorTicketLabels ? (
                            <TableRow>
                              <TableCell colSpan={5} className="h-24 text-center">
                                <div className="text-destructive">Error: {errorTicketLabels}</div>
                              </TableCell>
                            </TableRow>
                          ) : filteredTicketLabels.length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={5} className="h-24 text-center">
                                No ticket labels found.
                              </TableCell>
                            </TableRow>
                          ) : (
                            (() => {
                              // Calculate pagination for ticket labels
                              const totalPagesTicketLabels = Math.ceil(filteredTicketLabels.length / perPageTicketLabels);
                              const startIndexTicketLabels = (currentPageTicketLabels - 1) * perPageTicketLabels;
                              const endIndexTicketLabels = startIndexTicketLabels + perPageTicketLabels;
                              const displayedTicketLabels = filteredTicketLabels.slice(startIndexTicketLabels, endIndexTicketLabels);

                              return displayedTicketLabels.map((label, index) => (
                                <TableRow key={label.id} className="hover:bg-gray-50 border-b border-[#e4e4e4] last:border-b-0">
                                  <TableCell className="py-3">{startIndexTicketLabels + index + 1}</TableCell>
                                  <TableCell className="py-3">{label.label_name}</TableCell>
                                  <TableCell className="py-3">
                                    <div 
                                      className="w-24 h-6 rounded"
                                      style={{ backgroundColor: label.color }}
                                    />
                                  </TableCell>
                                  <TableCell className="py-3">
                                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                      {label.creator?.name || 'Unknown'}
                                    </span>
                                  </TableCell>
                                  <TableCell className="py-3">
                                    <div className="flex items-center justify-center space-x-1">
                                      <Button 
                                        variant="ghost" 
                                        size="sm"
                                        onClick={() => handleEditTicketLabel(label)}
                                        className="p-1 h-8 w-8"
                                      >
                                        <Edit className="h-4 w-4 text-blue-600" />
                                      </Button>
                                      <Button 
                                        variant="ghost" 
                                        size="sm"
                                        onClick={() => handleDeleteTicketLabel(label)}
                                        className="p-1 h-8 w-8"
                                      >
                                        <Trash2 className="h-4 w-4 text-red-600" />
                                      </Button>
                                    </div>
                                  </TableCell>
                                </TableRow>
                              ));
                            })()
                          )}
                        </TableBody>
                      </Table>
                    </div>
                    
                    {/* Pagination for Ticket Labels */}
                    {(() => {
                      const totalPagesTicketLabels = Math.ceil(filteredTicketLabels.length / perPageTicketLabels);
                      const totalItemsTicketLabels = filteredTicketLabels.length;
                      
                      if (totalPagesTicketLabels <= 1) return null;
                      
                      return (
                        <div className="flex items-center justify-between mt-4">
                          <div className="text-sm text-gray-600">
                            Showing {filteredTicketLabels.length === 0 ? 0 : ((currentPageTicketLabels - 1) * perPageTicketLabels) + 1} to{' '}
                            {Math.min(currentPageTicketLabels * perPageTicketLabels, totalItemsTicketLabels)} of {totalItemsTicketLabels} entries
                          </div>
                          <div className="flex items-center justify-center sm:justify-end space-x-1">
                            <span className="text-sm text-gray-600 mr-2">Previous</span>
                            {Array.from({ length: Math.min(5, totalPagesTicketLabels) }, (_, i) => {
                              let pageNum;
                              if (totalPagesTicketLabels <= 5) {
                                pageNum = i + 1;
                              } else if (currentPageTicketLabels <= 3) {
                                pageNum = i + 1;
                              } else if (currentPageTicketLabels >= totalPagesTicketLabels - 2) {
                                pageNum = totalPagesTicketLabels - 4 + i;
                              } else {
                                pageNum = currentPageTicketLabels - 2 + i;
                              }
                              return (
                                <Button
                                  key={i}
                                  variant={pageNum === currentPageTicketLabels ? "default" : "outline"}
                                  size="sm"
                                  className={`h-8 w-8 ${pageNum === currentPageTicketLabels ? 'bg-black text-white hover:bg-gray-800' : ''}`}
                                  onClick={() => setCurrentPageTicketLabels(pageNum)}
                                >
                                  {pageNum}
                                </Button>
                              );
                            })}
                            <span className="text-sm text-gray-600 ml-2">Next</span>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="additional-fields" className="mt-1.5">
              <div className="space-y-4">
                <div className="mb-6">
                  <h3 className="text-xl font-semibold text-gray-900">Additional Fields</h3>
                  <p className="text-sm text-gray-500 mt-1">Create custom fields for tickets to capture specific information</p>
                </div>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6">
                  {/* First Column - Form 25% */}
                  <div className="lg:col-span-1">
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-900">Additional Fields</h3>
                    <p className="text-sm text-gray-600">
                      Manage additional fields for tickets. Create custom fields with different types like select, text, or date.
                    </p>
                    
                    <div className="space-y-3">
                      <div>
                        <Label htmlFor="field-title">Field Title</Label>
                        <Input
                          id="field-title"
                          placeholder="Enter field title"
                          value={newFieldTitle}
                          onChange={(e) => setNewFieldTitle(e.target.value)}
                          disabled={savingAdditionalField}
                          className="mt-1"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="field-name">Field Name</Label>
                        <Input
                          id="field-name"
                          placeholder="Enter field name (no spaces)"
                          value={newFieldName}
                          onChange={(e) => setNewFieldName(e.target.value.replace(/\s/g, '_'))}
                          disabled={savingAdditionalField}
                          className="mt-1"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="field-type">Field Type</Label>
                        <Select 
                          value={newFieldType} 
                          onValueChange={setNewFieldType}
                          disabled={savingAdditionalField}
                        >
                          <SelectTrigger id="field-type" className="mt-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1">SELECT</SelectItem>
                            <SelectItem value="2">Text</SelectItem>
                            <SelectItem value="3">Date</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="field-required"
                            checked={newFieldMandatory}
                            onCheckedChange={(checked) => setNewFieldMandatory(checked as boolean)}
                            disabled={savingAdditionalField}
                          />
                          <Label htmlFor="field-required" className="text-sm font-normal cursor-pointer">
                            Required
                          </Label>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="field-show-filter"
                            checked={newFieldShowFilter}
                            onCheckedChange={(checked) => setNewFieldShowFilter(checked as boolean)}
                            disabled={savingAdditionalField}
                          />
                          <Label htmlFor="field-show-filter" className="text-sm font-normal cursor-pointer">
                            Show in Filter
                          </Label>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="field-show-list"
                            checked={newFieldShowList}
                            onCheckedChange={(checked) => setNewFieldShowList(checked as boolean)}
                            disabled={savingAdditionalField}
                          />
                          <Label htmlFor="field-show-list" className="text-sm font-normal cursor-pointer">
                            Show in List
                          </Label>
                        </div>
                      </div>
                      
                      {newFieldType === '1' && (
                        <>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="field-multiselect"
                              checked={newFieldMultiselect}
                              onCheckedChange={(checked) => setNewFieldMultiselect(checked as boolean)}
                              disabled={savingAdditionalField}
                            />
                            <Label htmlFor="field-multiselect" className="text-sm font-normal cursor-pointer">
                              Multiselect
                            </Label>
                          </div>
                          <div>
                            <Label>Enter Values for SELECT</Label>
                            <div className="space-y-2 mt-2">
                            {newFieldValues.map((value, index) => (
                              <div key={index} className="flex items-center space-x-2">
                                <Input
                                  placeholder="value"
                                  value={value}
                                  onChange={(e) => handleFieldValueChange(index, e.target.value)}
                                  disabled={savingAdditionalField}
                                />
                                {newFieldValues.length > 1 && (
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleRemoveFieldValue(index)}
                                    disabled={savingAdditionalField}
                                    className="p-2"
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                )}
                                {index === newFieldValues.length - 1 && (
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleAddFieldValue}
                                    disabled={savingAdditionalField}
                                    className="p-2"
                                  >
                                    <Plus className="h-4 w-4" />
                                  </Button>
                                )}
                              </div>
                            ))}
                            </div>
                          </div>
                        </>
                      )}
                      
                      <Button 
                        onClick={handleAddAdditionalField}
                        disabled={savingAdditionalField || !newFieldTitle.trim() || !newFieldName.trim()}
                        className="w-full bg-black hover:bg-gray-800 text-white"
                      >
                        {savingAdditionalField ? 'Adding...' : 'Add Additional Field'}
                      </Button>
                    </div>
                  </div>
                </div>
                
                {/* Second Column - Table 75% */}
                <div className="lg:col-span-3">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-600">Show</span>
                        <Select value={perPageAdditionalFields.toString()} onValueChange={handlePerPageChangeAdditionalFields}>
                          <SelectTrigger className="w-[70px] h-8">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="10">10</SelectItem>
                            <SelectItem value="25">25</SelectItem>
                            <SelectItem value="50">50</SelectItem>
                            <SelectItem value="100">100</SelectItem>
                          </SelectContent>
                        </Select>
                        <span className="text-sm text-gray-600">entries</span>
                      </div>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          placeholder="Search..."
                          value={searchTermAdditionalFields}
                          onChange={(e) => handleSearchChangeAdditionalFields(e.target.value)}
                          className="pl-9 pr-3 h-9 w-[300px]"
                        />
                      </div>
                    </div>
                    
                    <div className="overflow-x-auto border border-[#e4e4e4] rounded-lg bg-white">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-gray-50 border-b border-[#e4e4e4]">
                            <TableHead className="font-semibold text-gray-700 py-3 w-12">#</TableHead>
                            <TableHead className="font-semibold text-gray-700 py-3">Field Title</TableHead>
                            <TableHead className="font-semibold text-gray-700 py-3">Field Name</TableHead>
                            <TableHead className="font-semibold text-gray-700 py-3">Field Type</TableHead>
                            <TableHead className="font-semibold text-gray-700 py-3 text-center">Required</TableHead>
                            <TableHead className="font-semibold text-gray-700 py-3 text-center">Show in Filter</TableHead>
                            <TableHead className="font-semibold text-gray-700 py-3 text-center">Show in List</TableHead>
                            <TableHead className="font-semibold text-gray-700 py-3">Select Values</TableHead>
                            <TableHead className="font-semibold text-gray-700 py-3 text-center">Action</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {loadingAdditionalFields ? (
                            <TableRow>
                              <TableCell colSpan={9} className="h-24 text-center">
                                <div className="flex items-center justify-center">
                                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                                </div>
                              </TableCell>
                            </TableRow>
                          ) : errorAdditionalFields ? (
                            <TableRow>
                              <TableCell colSpan={9} className="h-24 text-center">
                                <div className="text-destructive">Error: {errorAdditionalFields}</div>
                              </TableCell>
                            </TableRow>
                          ) : filteredAdditionalFields.length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={9} className="h-24 text-center">
                                No additional fields found.
                              </TableCell>
                            </TableRow>
                          ) : (
                            (() => {
                              // Calculate pagination for additional fields
                              const totalPagesAdditionalFields = Math.ceil(filteredAdditionalFields.length / perPageAdditionalFields);
                              const startIndexAdditionalFields = (currentPageAdditionalFields - 1) * perPageAdditionalFields;
                              const endIndexAdditionalFields = startIndexAdditionalFields + perPageAdditionalFields;
                              const displayedAdditionalFields = filteredAdditionalFields.slice(startIndexAdditionalFields, endIndexAdditionalFields);

                              return displayedAdditionalFields.map((field, index) => (
                                <TableRow key={field.id} className="hover:bg-gray-50 border-b border-[#e4e4e4] last:border-b-0">
                                  <TableCell className="py-3">{startIndexAdditionalFields + index + 1}</TableCell>
                                  <TableCell className="py-3">{field.title}</TableCell>
                                  <TableCell className="py-3">{field.name}</TableCell>
                                  <TableCell className="py-3">{field.type_label || field.type}</TableCell>
                                  <TableCell className="py-3 text-center">
                                    {field.mandatory === 1 ? 'YES' : 'NO'}
                                  </TableCell>
                                  <TableCell className="py-3 text-center">
                                    {field.show_filter === 1 ? 'YES' : 'NO'}
                                  </TableCell>
                                  <TableCell className="py-3 text-center">
                                    {field.show_list === 1 ? 'YES' : 'NO'}
                                  </TableCell>
                                  <TableCell className="py-3">
                                    {field.value && field.value.length > 0 
                                      ? field.value.map(v => v.value).join(', ') 
                                      : '--'}
                                  </TableCell>
                                  <TableCell className="py-3">
                                    <div className="flex items-center justify-center space-x-1">
                                      <Button 
                                        variant="ghost" 
                                        size="sm"
                                        onClick={() => handleEditAdditionalField(field)}
                                        className="p-1 h-8 w-8"
                                      >
                                        <Edit className="h-4 w-4 text-blue-600" />
                                      </Button>
                                      <Button 
                                        variant="ghost" 
                                        size="sm"
                                        onClick={() => handleDeleteAdditionalField(field)}
                                        className="p-1 h-8 w-8"
                                      >
                                        <Trash2 className="h-4 w-4 text-red-600" />
                                      </Button>
                                    </div>
                                  </TableCell>
                                </TableRow>
                              ));
                            })()
                          )}
                        </TableBody>
                      </Table>
                    </div>
                    
                    {/* Pagination for Additional Fields */}
                    {(() => {
                      const totalPagesAdditionalFields = Math.ceil(filteredAdditionalFields.length / perPageAdditionalFields);
                      const totalItemsAdditionalFields = filteredAdditionalFields.length;
                      
                      if (totalPagesAdditionalFields <= 1) return null;
                      
                      return (
                        <div className="flex items-center justify-between mt-4">
                          <div className="text-sm text-gray-600">
                            Showing {filteredAdditionalFields.length === 0 ? 0 : ((currentPageAdditionalFields - 1) * perPageAdditionalFields) + 1} to{' '}
                            {Math.min(currentPageAdditionalFields * perPageAdditionalFields, totalItemsAdditionalFields)} of {totalItemsAdditionalFields} entries
                          </div>
                          <div className="flex items-center justify-center sm:justify-end space-x-1">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setCurrentPageAdditionalFields(Math.max(1, currentPageAdditionalFields - 1))}
                              disabled={currentPageAdditionalFields === 1}
                            >
                              Prev
                            </Button>
                            {Array.from({ length: Math.min(5, totalPagesAdditionalFields) }, (_, i) => {
                              let pageNum;
                              if (totalPagesAdditionalFields <= 5) {
                                pageNum = i + 1;
                              } else if (currentPageAdditionalFields <= 3) {
                                pageNum = i + 1;
                              } else if (currentPageAdditionalFields >= totalPagesAdditionalFields - 2) {
                                pageNum = totalPagesAdditionalFields - 4 + i;
                              } else {
                                pageNum = currentPageAdditionalFields - 2 + i;
                              }
                              return (
                                <Button
                                  key={i}
                                  variant={pageNum === currentPageAdditionalFields ? "default" : "outline"}
                                  size="sm"
                                  className={`h-8 w-8 ${pageNum === currentPageAdditionalFields ? 'bg-blue-600 text-white hover:bg-blue-700' : ''}`}
                                  onClick={() => setCurrentPageAdditionalFields(pageNum)}
                                >
                                  {pageNum}
                                </Button>
                              );
                            })}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setCurrentPageAdditionalFields(Math.min(totalPagesAdditionalFields, currentPageAdditionalFields + 1))}
                              disabled={currentPageAdditionalFields === totalPagesAdditionalFields}
                            >
                              Next
                            </Button>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* QR Codes Tab */}
            <TabsContent value="qr-codes" className="mt-1.5">
              <div className="space-y-4 sm:space-y-6">
                <div className="mb-6">
                  <h3 className="text-xl font-semibold text-gray-900">QR Code Management</h3>
                  <p className="text-sm text-gray-500 mt-1">Generate and manage QR codes for quick access to resources</p>
                </div>
                {/* Generate QR Code Section */}
                <div className="bg-white p-4 sm:p-6 rounded-lg border border-gray-200 shadow-sm">
                  <h3 className="text-base sm:text-lg font-semibold mb-4">Generate QR Code</h3>

                  {/* All controls in single line */}
                  <div className="flex flex-col lg:flex-row gap-3">
                    {/* Branch Selection */}
                    <div className="lg:w-[250px]">
                      <Label htmlFor="qr-branch" className="text-xs sm:text-sm mb-1 block font-medium">Select Branch</Label>
                      <Select value={selectedQRBranch} onValueChange={setSelectedQRBranch}>
                        <SelectTrigger className="w-full h-10">
                          <SelectValue placeholder="Select a branch" />
                        </SelectTrigger>
                        <SelectContent>
                          {allBranchesForDropdown.map((branch) => (
                            <SelectItem key={branch.id} value={branch.id.toString()}>
                              {branch.branch_name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Link Input */}
                    <div className="flex-1">
                      <Label htmlFor="qr-link" className="text-xs sm:text-sm mb-1 block font-medium">
                        Enter Link
                      </Label>
                      <Input
                        id="qr-link"
                        placeholder="Link will appear here after branch selection"
                        value={qrcodeLink}
                        onChange={(e) => setQrcodeLink(e.target.value)}
                        className="w-full text-sm h-10"
                        disabled={!selectedQRBranch}
                      />
                    </div>

                    {/* Generate Button */}
                    <div className="flex items-end">
                      <Button
                        onClick={handleGenerateQRCode}
                        disabled={generatingQRCode || !selectedQRBranch}
                        className="text-sm h-10 px-4 sm:px-6"
                      >
                        {generatingQRCode ? (
                          <>Generating...</>
                        ) : (
                          <>
                            <QrCode className="h-4 w-4 mr-2" />
                            Generate QR Code
                          </>
                        )}
                      </Button>
                    </div>
                  </div>

                  {/* Link Preview */}
                  {selectedQRBranch && (
                    <div className="mt-2">
                      <p className="text-xs text-gray-600">
                        Preview: <span className="font-medium text-blue-600">{window.location.origin}/register?branch_id={selectedQRBranch}</span>
                      </p>
                    </div>
                  )}
                </div>

                {/* QR Codes List */}
                <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
                  <div className="px-4 sm:px-6 py-4 border-b border-gray-200 bg-gray-50">
                    <h3 className="text-base sm:text-lg font-semibold">Generated QR Codes</h3>
                  </div>
                  
                  {loadingQRCodes ? (
                    <div className="p-8 text-center">
                      <div className="inline-flex items-center text-gray-500 text-sm">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-purple-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Loading QR codes...
                      </div>
                    </div>
                  ) : qrcodes.length === 0 ? (
                    <div className="p-12 text-center">
                      <QrCode className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                      <p className="text-gray-500 text-sm">No QR codes generated yet</p>
                      <p className="text-gray-400 text-xs mt-1">Generate your first QR code above</p>
                    </div>
                  ) : (
                    <>
                      {/* Mobile View - Enhanced Cards */}
                      <div className="block md:hidden divide-y divide-gray-200">
                        {qrcodes.map((qrcode) => (
                          <div key={qrcode.id} className="p-4 hover:bg-gray-50 transition-colors">
                            <div className="space-y-3">
                              {/* Header with QR Code and Link */}
                              <div className="flex items-start gap-3">
                                {/* QR Code Image - Clickable */}
                                <div className="flex-shrink-0">
                                  <a
                                    href={`/${qrcode.qrcode_file}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="block h-20 w-20 bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg shadow-sm p-2 border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
                                  >
                                    <img
                                      src={`/${qrcode.qrcode_file}`}
                                      alt="QR Code"
                                      className="h-full w-full object-contain"
                                    />
                                  </a>
                                </div>
                                
                                {/* QR Code Details */}
                                <div className="flex-1 min-w-0 space-y-2">
                                  <div className="bg-gray-50 px-3 py-2 rounded-lg">
                                    <p className="text-xs text-gray-500 mb-1">Link:</p>
                                    <a
                                      href={qrcode.web_link}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-sm text-blue-600 hover:text-blue-800 inline-flex items-center gap-1 break-all"
                                    >
                                      <span className="line-clamp-2">{qrcode.web_link}</span>
                                      <ExternalLink className="h-3 w-3 flex-shrink-0" />
                                    </a>
                                  </div>
                                  <div className="flex items-center gap-4 text-xs text-gray-500">
                                    <span className="flex items-center gap-1">
                                      <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                      </svg>
                                      {qrcode.creator?.name || 'System'}
                                    </span>
                                    <span className="flex items-center gap-1">
                                      <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                      </svg>
                                      {new Date(qrcode.created_at).toLocaleDateString()}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              
                              {/* Action Buttons - Mobile Grid */}
                              <div className="grid grid-cols-4 gap-2">
                                <a
                                  href={`/${qrcode.qrcode_file}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex flex-col items-center justify-center p-2 text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300 transition-colors"
                                >
                                  <Eye className="h-4 w-4 mb-1" />
                                  <span className="text-xs">View</span>
                                </a>
                                <button
                                  onClick={() => {
                                    navigator.clipboard.writeText(qrcode.web_link);
                                    toast.success('Link copied!');
                                  }}
                                  className="flex flex-col items-center justify-center p-2 text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-purple-50 hover:text-purple-600 hover:border-purple-300 transition-colors"
                                >
                                  <Copy className="h-4 w-4 mb-1" />
                                  <span className="text-xs">Copy</span>
                                </button>
                                <a
                                  href={`/${qrcode.qrcode_file}`}
                                  download
                                  className="flex flex-col items-center justify-center p-2 text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-green-50 hover:text-green-600 hover:border-green-300 transition-colors"
                                >
                                  <Download className="h-4 w-4 mb-1" />
                                  <span className="text-xs">Save</span>
                                </a>
                                <button
                                  onClick={() => {
                                    setDeletingQRCode(qrcode);
                                    setDeleteQRCodeModalOpen(true);
                                  }}
                                  className="flex flex-col items-center justify-center p-2 text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-red-50 hover:text-red-600 hover:border-red-300 transition-colors"
                                >
                                  <Trash2 className="h-4 w-4 mb-1" />
                                  <span className="text-xs">Delete</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Desktop View - Enhanced Table */}
                      <div className="hidden md:block overflow-x-auto">
                        <table className="w-full">
                          <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                QR Code
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[200px]">
                                Link
                              </th>
                              <th className="hidden lg:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Created By
                              </th>
                              <th className="hidden xl:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Date
                              </th>
                              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Actions
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {qrcodes.map((qrcode) => (
                              <tr key={qrcode.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="relative group">
                                    <a
                                      href={`/${qrcode.qrcode_file}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="block h-20 w-20 bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg shadow-md p-2 transition-all duration-200 hover:scale-110 hover:shadow-lg border border-gray-200 cursor-pointer"
                                    >
                                      <img
                                        src={`/${qrcode.qrcode_file}`}
                                        alt="QR Code"
                                        className="h-full w-full object-contain"
                                      />
                                    </a>
                                  </div>
                                </td>
                                <td className="px-6 py-4">
                                  <a
                                    href={qrcode.web_link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:text-blue-800 text-sm inline-flex items-center gap-1 max-w-xs truncate group"
                                  >
                                    <span className="truncate">{qrcode.web_link}</span>
                                    <ExternalLink className="h-3 w-3 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                                  </a>
                                </td>
                                <td className="hidden lg:table-cell px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                  <div className="flex items-center">
                                    <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-medium text-gray-600 mr-2">
                                      {(qrcode.creator?.name || 'S')[0].toUpperCase()}
                                    </div>
                                    <span>{qrcode.creator?.name || 'System'}</span>
                                  </div>
                                </td>
                                <td className="hidden xl:table-cell px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                  <div className="flex flex-col">
                                    <span>{new Date(qrcode.created_at).toLocaleDateString()}</span>
                                    <span className="text-xs text-gray-400">{new Date(qrcode.created_at).toLocaleTimeString()}</span>
                                  </div>
                                </td>
                                <td className="px-6 py-4">
                                  <div className="flex items-center justify-center gap-1">
                                    {/* View Button */}
                                    <a
                                      href={`/${qrcode.qrcode_file}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="group relative inline-flex items-center justify-center p-2 text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300 transition-all duration-200"
                                      title="View QR Code"
                                    >
                                      <Eye className="h-4 w-4" />
                                      <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                                        View
                                      </span>
                                    </a>
                                    
                                    {/* Copy Link Button */}
                                    <button
                                      onClick={() => {
                                        navigator.clipboard.writeText(qrcode.web_link);
                                        toast.success('Link copied to clipboard!');
                                      }}
                                      className="group relative inline-flex items-center justify-center p-2 text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-purple-50 hover:text-purple-600 hover:border-purple-300 transition-all duration-200"
                                      title="Copy Link"
                                    >
                                      <Copy className="h-4 w-4" />
                                      <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                                        Copy
                                      </span>
                                    </button>
                                    
                                    {/* Download Button */}
                                    <a
                                      href={`/${qrcode.qrcode_file}`}
                                      download
                                      className="group relative inline-flex items-center justify-center p-2 text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-green-50 hover:text-green-600 hover:border-green-300 transition-all duration-200"
                                      title="Download QR Code"
                                    >
                                      <Download className="h-4 w-4" />
                                      <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                                        Download
                                      </span>
                                    </a>
                                    
                                    {/* Delete Button */}
                                    <button
                                      onClick={() => {
                                        setDeletingQRCode(qrcode);
                                        setDeleteQRCodeModalOpen(true);
                                      }}
                                      className="group relative inline-flex items-center justify-center p-2 text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-red-50 hover:text-red-600 hover:border-red-300 transition-all duration-200"
                                      title="Delete QR Code"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                      <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                                        Delete
                                      </span>
                                    </button>
                                  </div>
                                </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    </>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="notification-settings" className="mt-1.5">
              <div className="space-y-4">
                <div className="mb-6">
                  <h3 className="text-xl font-semibold text-gray-900">Whatsapp Settings</h3>
                  <p className="text-sm text-gray-500 mt-1">Manage your WhatsApp messaging templates and API configurations</p>
                </div>

                {/* Filters and Search */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                    <div className="relative flex-1 sm:flex-initial">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-3 sm:h-4 w-3 sm:w-4 text-gray-400" />
                      <Input
                        placeholder="Search WhatsApp settings..."
                        value={searchTermMessages}
                        onChange={(e) => { setSearchTermMessages(e.target.value); setCurrentPageMessages(1); }}
                        className="pl-8 sm:pl-9 pr-3 h-8 sm:h-9 w-full sm:w-[250px] text-sm"
                      />
                    </div>
                  </div>
                  <Button
                    className="bg-black hover:bg-gray-800 text-white text-xs sm:text-sm h-8 sm:h-9"
                    onClick={() => {
                      setEditingMessage(null);
                      setMessageFormData({
                        vendor_name: '',
                        whatsapp_api: '',
                        api_token: '',
                        phone_number_id: '',
                        status: true,
                      });
                      setMessageModalOpen(true);
                    }}
                  >
                    <Plus className="mr-1 sm:mr-2 h-3 sm:h-4 w-3 sm:w-4" />
                    Add Settings
                  </Button>
                </div>

                {/* Desktop Table View */}
                <div className="hidden md:block overflow-x-auto border border-[#e4e4e4] rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50 border-b border-[#e4e4e4]">
                        <TableHead className="font-semibold text-gray-700 py-3">Sl No</TableHead>
                        <TableHead className="font-semibold text-gray-700 py-3">Vendor Name</TableHead>
                        <TableHead className="font-semibold text-gray-700 py-3">WhatsApp API</TableHead>
                        <TableHead className="font-semibold text-gray-700 py-3">API Token</TableHead>
                        <TableHead className="font-semibold text-gray-700 py-3">Phone Number ID</TableHead>
                        <TableHead className="font-semibold text-gray-700 py-3">Status</TableHead>
                        <TableHead className="font-semibold text-gray-700 py-3 text-center">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {loadingMessages ? (
                        <TableRow>
                          <TableCell colSpan={7} className="h-24 text-center">
                            <div className="flex items-center justify-center">
                              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : messageSettings.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="h-24 text-center">
                            No WhatsApp settings found.
                          </TableCell>
                        </TableRow>
                      ) : (
                        messageSettings
                          .filter((message) => {
                            if (!searchTermMessages) return true;
                            const searchLower = searchTermMessages.toLowerCase();
                            return (
                              message.vendor_name?.toLowerCase().includes(searchLower) ||
                              message.whatsapp_api?.toLowerCase().includes(searchLower) ||
                              message.api_token?.toLowerCase().includes(searchLower)
                            );
                          })
                          .map((message, index) => (
                          <TableRow key={message.id} className="hover:bg-gray-50 border-b border-[#e4e4e4] last:border-b-0">
                            <TableCell className="py-3">
                              <span className="font-medium text-gray-700">
                                {((currentPageMessages - 1) * perPageMessages) + index + 1}
                              </span>
                            </TableCell>
                            <TableCell className="py-3">
                              <div className="flex items-center gap-2">
                                <MessageCircle className="h-4 w-4 text-gray-400" />
                                <span className="font-medium">
                                  {message.vendor_name || '-'}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell className="py-3">
                              {message.whatsapp_api ? (
                                <span className="text-sm truncate max-w-[200px] block" title={message.whatsapp_api}>
                                  {message.whatsapp_api}
                                </span>
                              ) : '-'}
                            </TableCell>
                            <TableCell className="py-3">
                              {message.masked_token || message.api_token ? (
                                <span className="text-sm truncate max-w-[200px] block" title={message.masked_token || message.api_token}>
                                  {message.masked_token || message.api_token}
                                </span>
                              ) : '-'}
                            </TableCell>
                            <TableCell className="py-3">
                              {message.phone_number_id ? (
                                <span className="text-sm font-mono truncate max-w-[150px] block" title={message.phone_number_id}>
                                  {message.phone_number_id}
                                </span>
                              ) : '-'}
                            </TableCell>
                            <TableCell className="py-3">
                              <span
                                onClick={() => handleToggleStatus(message)}
                                className={`px-2 py-1 rounded-full text-xs font-medium cursor-pointer transition-all hover:opacity-80 ${
                                  message.status
                                    ? 'bg-green-100 text-green-800 hover:bg-green-200'
                                    : 'bg-red-100 text-red-800 hover:bg-red-200'
                                }`}
                                title="Click to toggle status"
                              >
                                {message.status ? 'Active' : 'Inactive'}
                              </span>
                            </TableCell>
                            <TableCell className="py-3">
                              <div className="flex items-center justify-center space-x-1">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={() => {
                                    setEditingMessage(message);
                                    setMessageFormData({
                                      vendor_name: message.vendor_name || '',
                                      whatsapp_api: message.whatsapp_api || '',
                                      api_token: '',
                                      phone_number_id: message.phone_number_id || '',
                                      status: message.status,
                                    });
                                    setMessageModalOpen(true);
                                  }}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={() => {
                                    setDeletingMessage(message);
                                    setDeleteMessageModalOpen(true);
                                  }}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>

                {/* Mobile Card View */}
                <div className="block md:hidden space-y-3">
                  {loadingMessages ? (
                    <div className="flex items-center justify-center h-24">
                      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                    </div>
                  ) : messageSettings.length === 0 ? (
                    <div className="text-center text-gray-500 p-6">No WhatsApp settings found.</div>
                  ) : (
                    messageSettings
                      .filter((message) => {
                        if (!searchTermMessages) return true;
                        const searchLower = searchTermMessages.toLowerCase();
                        return (
                          message.vendor_name?.toLowerCase().includes(searchLower) ||
                          message.whatsapp_api?.toLowerCase().includes(searchLower) ||
                          message.api_token?.toLowerCase().includes(searchLower)
                        );
                      })
                      .map((message, index) => (
                      <div key={message.id} className="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
                        <div className="flex justify-between items-start">
                          <div className="space-y-1 flex-1">
                            <div className="flex items-center gap-2">
                              <span className="bg-gray-100 text-gray-700 text-xs font-semibold px-2 py-1 rounded">
                                #{((currentPageMessages - 1) * perPageMessages) + index + 1}
                              </span>
                              <MessageCircle className="h-4 w-4 text-gray-400" />
                              <h4 className="font-semibold text-gray-900">
                                {message.vendor_name || 'No Vendor Name'}
                              </h4>
                            </div>
                            {message.whatsapp_api && (
                              <p className="text-sm text-gray-600 break-all">{message.whatsapp_api}</p>
                            )}
                            {(message.masked_token || message.api_token) && (
                              <p className="text-xs font-mono text-gray-500">
                                Token: {message.masked_token || '••••••••'}
                              </p>
                            )}
                          </div>
                          <span
                            onClick={() => handleToggleStatus(message)}
                            className={`px-2 py-1 rounded-full text-xs font-medium cursor-pointer transition-all hover:opacity-80 ${
                              message.status
                                ? 'bg-green-100 text-green-800 hover:bg-green-200'
                                : 'bg-red-100 text-red-800 hover:bg-red-200'
                            }`}
                            title="Click to toggle status"
                          >
                            {message.status ? 'Active' : 'Inactive'}
                          </span>
                        </div>

                        <div className="flex gap-2 pt-2 border-t">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setEditingMessage(message);
                              setMessageFormData({
                                vendor_name: message.vendor_name || '',
                                whatsapp_api: message.whatsapp_api || '',
                                api_token: '',
                                phone_number_id: message.phone_number_id || '',
                                status: message.status,
                              });
                              setMessageModalOpen(true);
                            }}
                            className="flex-1"
                          >
                            <Edit className="h-3 w-3 mr-1" />
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setDeletingMessage(message);
                              setDeleteMessageModalOpen(true);
                            }}
                            className="flex-1 text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-3 w-3 mr-1" />
                            Delete
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Pagination */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="text-xs sm:text-sm text-gray-600 text-center sm:text-left">
                    Showing {messageSettings.length === 0 ? 0 : ((currentPageMessages - 1) * perPageMessages) + 1} to{' '}
                    {Math.min(currentPageMessages * perPageMessages, messageSettings.length)} of {messageSettings.length} entries
                  </div>
                  <div className="flex items-center justify-center sm:justify-end space-x-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPageMessages(Math.max(1, currentPageMessages - 1))}
                      disabled={currentPageMessages === 1}
                      className="text-xs sm:text-sm"
                    >
                      Previous
                    </Button>
                    <div className="hidden sm:flex items-center space-x-1">
                      {Array.from({ length: Math.min(5, totalPagesMessages) }, (_, i) => {
                        let pageNum;
                        if (totalPagesMessages <= 5) {
                          pageNum = i + 1;
                        } else if (currentPageMessages <= 3) {
                          pageNum = i + 1;
                        } else if (currentPageMessages >= totalPagesMessages - 2) {
                          pageNum = totalPagesMessages - 4 + i;
                        } else {
                          pageNum = currentPageMessages - 2 + i;
                        }
                        return (
                          <Button
                            key={i}
                            variant={pageNum === currentPageMessages ? "default" : "outline"}
                            size="sm"
                            className={`h-8 w-8 ${pageNum === currentPageMessages ? 'bg-black text-white hover:bg-gray-800' : ''}`}
                            onClick={() => setCurrentPageMessages(pageNum)}
                          >
                            {pageNum}
                          </Button>
                        );
                      })}
                    </div>
                    <div className="flex sm:hidden items-center px-3 text-xs">
                      Page {currentPageMessages} of {totalPagesMessages}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPageMessages(Math.min(totalPagesMessages, currentPageMessages + 1))}
                      disabled={currentPageMessages === totalPagesMessages}
                      className="text-xs sm:text-sm"
                    >
                      Next
                    </Button>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Telegram Notifications Tab Content */}
            <TabsContent value="telegram-notifications" className="mt-1.5">
              <div className="space-y-4">
                <div className="mb-6">
                  <h3 className="text-xl font-semibold text-gray-900">Telegram Notifications</h3>
                  <p className="text-sm text-gray-500 mt-1">Configure which events trigger Telegram notifications</p>
                </div>

                {/* Telegram Notification Settings Card */}
                <div className="border border-[#e4e4e4] rounded-lg overflow-hidden">
                  {/* Header */}
                  <div className="bg-blue-50 px-5 py-4 flex items-center gap-3 border-b border-[#e4e4e4]">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Send className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Telegram Notifications</h4>
                      <p className="text-sm text-gray-500">Configure which events trigger Telegram notifications</p>
                    </div>
                  </div>

                  {/* Settings List */}
                  <div className="divide-y divide-[#e4e4e4]">
                    {loadingTelegramSettings ? (
                      <div className="p-8 flex items-center justify-center">
                        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
                      </div>
                    ) : telegramSettings.length === 0 ? (
                      <div className="p-8 text-center text-gray-500">
                        No notification settings found. Settings will be created automatically.
                      </div>
                    ) : (
                      telegramSettings.map((setting) => (
                        <div
                          key={setting.id}
                          className={`px-5 py-4 flex items-center justify-between ${
                            setting.is_active ? 'bg-orange-50' : 'bg-white'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${setting.is_active ? 'bg-orange-100' : 'bg-gray-100'}`}>
                              {setting.event_type === 'new_ticket' ? (
                                <Bell className={`h-4 w-4 ${setting.is_active ? 'text-orange-600' : 'text-gray-400'}`} />
                              ) : (
                                <RefreshCw className={`h-4 w-4 ${setting.is_active ? 'text-orange-600' : 'text-gray-400'}`} />
                              )}
                            </div>
                            <div>
                              <h5 className="font-medium text-gray-900">{setting.event_name}</h5>
                              <p className="text-sm text-gray-500">{setting.description}</p>
                            </div>
                          </div>
                          <button
                            onClick={() => handleToggleTelegramSetting(setting.id)}
                            disabled={togglingTelegramSetting === setting.id}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                              setting.is_active ? 'bg-blue-600' : 'bg-gray-300'
                            } ${togglingTelegramSetting === setting.id ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                setting.is_active ? 'translate-x-6' : 'translate-x-1'
                              }`}
                            />
                          </button>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Note */}
                  <div className="bg-gray-50 px-5 py-3 border-t border-[#e4e4e4]">
                    <p className="text-sm text-gray-500">
                      <strong>Note:</strong> Make sure Telegram Bot Token and Chat ID are configured in the environment settings for notifications to work properly.
                    </p>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* SMS Settings Tab Content */}
            <TabsContent value="sms-settings" className="mt-1.5">
              <div className="space-y-4">
                <div className="mb-6">
                  <h3 className="text-xl font-semibold text-gray-900">SMS Settings</h3>
                  <p className="text-sm text-gray-500 mt-1">Manage your SMS API configurations and settings</p>
                </div>

                {/* Filters and Search */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                    <div className="relative flex-1 sm:flex-initial">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-3 sm:h-4 w-3 sm:w-4 text-gray-400" />
                      <Input
                        placeholder="Search SMS settings..."
                        value={searchTermSms}
                        onChange={(e) => { setSearchTermSms(e.target.value); setCurrentPageSms(1); }}
                        className="pl-8 sm:pl-9 pr-3 h-8 sm:h-9 w-full sm:w-[250px] text-sm"
                      />
                    </div>
                  </div>
                  <Button
                    className="bg-black hover:bg-gray-800 text-white text-xs sm:text-sm h-8 sm:h-9"
                    onClick={() => {
                      setEditingSms(null);
                      setSmsFormData({
                        vendor_name: '',
                        sms_api: '',
                        api_token: '',
                        sender_id: '',
                        status: true,
                      });
                      setSmsModalOpen(true);
                    }}
                  >
                    <Plus className="mr-1 sm:mr-2 h-3 sm:h-4 w-3 sm:w-4" />
                    Add Settings
                  </Button>
                </div>

                {/* Desktop Table View */}
                <div className="hidden md:block overflow-x-auto border border-[#e4e4e4] rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50 border-b border-[#e4e4e4]">
                        <TableHead className="font-semibold text-gray-700 py-3">Sl No</TableHead>
                        <TableHead className="font-semibold text-gray-700 py-3">Vendor Name</TableHead>
                        <TableHead className="font-semibold text-gray-700 py-3">SMS API</TableHead>
                        <TableHead className="font-semibold text-gray-700 py-3">API Token</TableHead>
                        <TableHead className="font-semibold text-gray-700 py-3">Sender ID</TableHead>
                        <TableHead className="font-semibold text-gray-700 py-3">Status</TableHead>
                        <TableHead className="font-semibold text-gray-700 py-3 text-center">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {loadingSms ? (
                        <TableRow>
                          <TableCell colSpan={7} className="h-24 text-center">
                            <div className="flex items-center justify-center">
                              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : smsSettings.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="h-24 text-center">
                            No SMS settings found.
                          </TableCell>
                        </TableRow>
                      ) : (
                        smsSettings
                          .filter((sms) => {
                            if (!searchTermSms) return true;
                            const searchLower = searchTermSms.toLowerCase();
                            return (
                              sms.vendor_name?.toLowerCase().includes(searchLower) ||
                              sms.sms_api?.toLowerCase().includes(searchLower) ||
                              sms.sender_id?.toLowerCase().includes(searchLower)
                            );
                          })
                          .map((sms, index) => (
                          <TableRow key={sms.id} className="hover:bg-gray-50 border-b border-[#e4e4e4] last:border-b-0">
                            <TableCell className="py-3">
                              <span className="font-medium text-gray-700">
                                {((currentPageSms - 1) * perPageSms) + index + 1}
                              </span>
                            </TableCell>
                            <TableCell className="py-3">
                              <div className="flex items-center gap-2">
                                <MessageCircle className="h-4 w-4 text-gray-400" />
                                <span className="font-medium">
                                  {sms.vendor_name || '-'}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell className="py-3">
                              {sms.sms_api ? (
                                <span className="text-sm truncate max-w-[200px] block" title={sms.sms_api}>
                                  {sms.sms_api}
                                </span>
                              ) : '-'}
                            </TableCell>
                            <TableCell className="py-3">
                              {sms.masked_token || sms.api_token ? (
                                <span className="text-sm truncate max-w-[200px] block" title={sms.masked_token || sms.api_token}>
                                  {sms.masked_token || sms.api_token}
                                </span>
                              ) : '-'}
                            </TableCell>
                            <TableCell className="py-3">
                              {sms.sender_id ? (
                                <span className="text-sm font-mono truncate max-w-[150px] block" title={sms.sender_id}>
                                  {sms.sender_id}
                                </span>
                              ) : '-'}
                            </TableCell>
                            <TableCell className="py-3">
                              <span
                                onClick={() => handleToggleSmsStatus(sms)}
                                className={`px-2 py-1 rounded-full text-xs font-medium cursor-pointer transition-all hover:opacity-80 ${
                                  sms.status
                                    ? 'bg-green-100 text-green-800 hover:bg-green-200'
                                    : 'bg-red-100 text-red-800 hover:bg-red-200'
                                }`}
                                title="Click to toggle status"
                              >
                                {sms.status ? 'Active' : 'Inactive'}
                              </span>
                            </TableCell>
                            <TableCell className="py-3">
                              <div className="flex items-center justify-center space-x-1">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={() => {
                                    setEditingSms(sms);
                                    setSmsFormData({
                                      vendor_name: sms.vendor_name || '',
                                      sms_api: sms.sms_api || '',
                                      api_token: '',
                                      sender_id: sms.sender_id || '',
                                      status: sms.status,
                                    });
                                    setSmsModalOpen(true);
                                  }}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={() => {
                                    setDeletingSms(sms);
                                    setDeleteSmsModalOpen(true);
                                  }}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>

                {/* Mobile Card View */}
                <div className="block md:hidden space-y-3">
                  {loadingSms ? (
                    <div className="flex items-center justify-center h-24">
                      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                    </div>
                  ) : smsSettings.length === 0 ? (
                    <div className="text-center text-gray-500 p-6">No SMS settings found.</div>
                  ) : (
                    smsSettings
                      .filter((sms) => {
                        if (!searchTermSms) return true;
                        const searchLower = searchTermSms.toLowerCase();
                        return (
                          sms.vendor_name?.toLowerCase().includes(searchLower) ||
                          sms.sms_api?.toLowerCase().includes(searchLower) ||
                          sms.sender_id?.toLowerCase().includes(searchLower)
                        );
                      })
                      .map((sms, index) => (
                      <div key={sms.id} className="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
                        <div className="flex justify-between items-start">
                          <div className="space-y-1 flex-1">
                            <div className="flex items-center gap-2">
                              <span className="bg-gray-100 text-gray-700 text-xs font-semibold px-2 py-1 rounded">
                                #{((currentPageSms - 1) * perPageSms) + index + 1}
                              </span>
                              <MessageCircle className="h-4 w-4 text-gray-400" />
                              <h4 className="font-semibold text-gray-900">
                                {sms.vendor_name || 'No Vendor Name'}
                              </h4>
                            </div>
                            {sms.sms_api && (
                              <p className="text-sm text-gray-600 break-all">{sms.sms_api}</p>
                            )}
                            {(sms.masked_token || sms.api_token) && (
                              <p className="text-xs font-mono text-gray-500">
                                Token: {sms.masked_token || '••••••••'}
                              </p>
                            )}
                            {sms.sender_id && (
                              <p className="text-xs text-gray-500">
                                Sender ID: {sms.sender_id}
                              </p>
                            )}
                          </div>
                          <span
                            onClick={() => handleToggleSmsStatus(sms)}
                            className={`px-2 py-1 rounded-full text-xs font-medium cursor-pointer transition-all hover:opacity-80 ${
                              sms.status
                                ? 'bg-green-100 text-green-800 hover:bg-green-200'
                                : 'bg-red-100 text-red-800 hover:bg-red-200'
                            }`}
                            title="Click to toggle status"
                          >
                            {sms.status ? 'Active' : 'Inactive'}
                          </span>
                        </div>

                        <div className="flex gap-2 pt-2 border-t">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setEditingSms(sms);
                              setSmsFormData({
                                vendor_name: sms.vendor_name || '',
                                sms_api: sms.sms_api || '',
                                api_token: '',
                                sender_id: sms.sender_id || '',
                                status: sms.status,
                              });
                              setSmsModalOpen(true);
                            }}
                            className="flex-1"
                          >
                            <Edit className="h-3 w-3 mr-1" />
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setDeletingSms(sms);
                              setDeleteSmsModalOpen(true);
                            }}
                            className="flex-1 text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-3 w-3 mr-1" />
                            Delete
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Pagination */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="text-xs sm:text-sm text-gray-600 text-center sm:text-left">
                    Showing {smsSettings.length === 0 ? 0 : ((currentPageSms - 1) * perPageSms) + 1} to{' '}
                    {Math.min(currentPageSms * perPageSms, smsSettings.length)} of {smsSettings.length} entries
                  </div>
                  <div className="flex items-center justify-center sm:justify-end space-x-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPageSms(Math.max(1, currentPageSms - 1))}
                      disabled={currentPageSms === 1}
                      className="text-xs sm:text-sm"
                    >
                      Previous
                    </Button>
                    <div className="hidden sm:flex items-center space-x-1">
                      {Array.from({ length: Math.min(5, totalPagesSms) }, (_, i) => {
                        let pageNum;
                        if (totalPagesSms <= 5) {
                          pageNum = i + 1;
                        } else if (currentPageSms <= 3) {
                          pageNum = i + 1;
                        } else if (currentPageSms >= totalPagesSms - 2) {
                          pageNum = totalPagesSms - 4 + i;
                        } else {
                          pageNum = currentPageSms - 2 + i;
                        }
                        return (
                          <Button
                            key={i}
                            variant={pageNum === currentPageSms ? "default" : "outline"}
                            size="sm"
                            className={`h-8 w-8 ${pageNum === currentPageSms ? 'bg-black text-white hover:bg-gray-800' : ''}`}
                            onClick={() => setCurrentPageSms(pageNum)}
                          >
                            {pageNum}
                          </Button>
                        );
                      })}
                    </div>
                    <div className="flex sm:hidden items-center px-3 text-xs">
                      Page {currentPageSms} of {totalPagesSms}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPageSms(Math.min(totalPagesSms, currentPageSms + 1))}
                      disabled={currentPageSms === totalPagesSms}
                      className="text-xs sm:text-sm"
                    >
                      Next
                    </Button>
                  </div>
                </div>
              </div>
            </TabsContent>
            </div>{/* End of content wrapper */}
          </Tabs>
        </div>

        {/* User Modal (Add/Edit) */}
        <Dialog open={userModalOpen} onOpenChange={setUserModalOpen}>
          <DialogContent style={{ width: '400px', maxWidth: '90vw' }}>
            <DialogHeader>
              <DialogTitle>{isEditMode ? 'Edit User' : 'Add New User'}</DialogTitle>
              <DialogDescription>
                {isEditMode ? 'Update user information' : 'Create a new user account'}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="add-name">Name</Label>
                <Input
                  id="add-name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter name"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="add-email">Email</Label>
                <Input
                  id="add-email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="Enter email"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="add-department">Department</Label>
                  <Select 
                    value={formData.department_id} 
                    onValueChange={(value) => setFormData({ ...formData, department_id: value })}
                  >
                    <SelectTrigger id="add-department">
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      {allDepartments.map((dept) => (
                        <SelectItem key={dept.id} value={dept.id.toString()}>
                          {dept.department_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="add-designation">Designation</Label>
                  <Select 
                    value={formData.designation_id} 
                    onValueChange={(value) => setFormData({ ...formData, designation_id: value })}
                  >
                    <SelectTrigger id="add-designation">
                      <SelectValue placeholder="Select designation" />
                    </SelectTrigger>
                    <SelectContent>
                      {allDesignations.map((desig) => (
                        <SelectItem key={desig.id} value={desig.id.toString()}>
                          {desig.designation_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              {!isEditMode && (
                <>
                  <div className="grid gap-2">
                    <Label htmlFor="add-password">Password</Label>
                    <Input
                      id="add-password"
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      placeholder="Enter password"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="add-password-confirm">Confirm Password</Label>
                    <Input
                      id="add-password-confirm"
                      type="password"
                      value={formData.password_confirmation}
                      onChange={(e) => setFormData({ ...formData, password_confirmation: e.target.value })}
                      placeholder="Confirm password"
                    />
                  </div>
                </>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="add-role">Role</Label>
                  <Select 
                    value={formData.role_id} 
                    onValueChange={(value) => setFormData({ ...formData, role_id: value })}
                  >
                    <SelectTrigger id="add-role">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {currentUser?.role_id === 4 ? (
                        // Branch Admin can only add Agents
                        <SelectItem value="2">Agent</SelectItem>
                      ) : currentUser?.role_id === 1 ? (
                        // Super Admin can add Agent, Branch Admin, Manager
                        <>
                          <SelectItem value="2">Agent</SelectItem>
                          <SelectItem value="4">Branch Admin</SelectItem>
                          <SelectItem value="3">Manager</SelectItem>
                        </>
                      ) : (
                        // Default fallback
                        <SelectItem value="2">Agent</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="add-status">Status</Label>
                  <Select 
                    value={formData.status} 
                    onValueChange={(value) => setFormData({ ...formData, status: value })}
                  >
                    <SelectTrigger id="add-status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Active</SelectItem>
                      <SelectItem value="0">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              {/* Branch dropdown for Super Admin */}
              {!isEditMode && currentUser?.role_id === 1 && (
                <div className="grid gap-2">
                  <Label htmlFor="add-branch">Branch</Label>
                  <Select 
                    value={formData.branch_id} 
                    onValueChange={(value) => setFormData({ ...formData, branch_id: value })}
                  >
                    <SelectTrigger id="add-branch">
                      <SelectValue placeholder="Select branch" />
                    </SelectTrigger>
                    <SelectContent>
                      {allBranchesForDropdown.map((branch) => (
                        <SelectItem key={branch.id} value={branch.id.toString()}>
                          {branch.branch_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setUserModalOpen(false)}
              >
                Cancel
              </Button>
              <Button 
                type="button" 
                onClick={handleSaveUser}
                disabled={saving || !formData.name || !formData.email || (!isEditMode && !formData.password) || !formData.department_id || !formData.designation_id}
              >
                {saving ? (isEditMode ? 'Saving...' : 'Creating...') : (isEditMode ? 'Save Changes' : 'Create User')}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>


        {/* Delete Confirmation Modal */}
        <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
          <DialogContent style={{ width: '400px', maxWidth: '90vw' }}>
            <DialogHeader>
              <DialogTitle>Delete User</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete user "{deletingUser?.name}"? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setDeleteModalOpen(false)}
              >
                Cancel
              </Button>
              <Button 
                type="button" 
                variant="destructive"
                onClick={handleConfirmDelete}
                disabled={saving}
              >
                {saving ? 'Deleting...' : 'Delete'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Change Password Modal */}
        <Dialog open={changePasswordModalOpen} onOpenChange={setChangePasswordModalOpen}>
          <DialogContent style={{ width: '400px', maxWidth: '90vw' }}>
            <DialogHeader>
              <DialogTitle>Change Password</DialogTitle>
              <DialogDescription>
                Change password for user "{changingPasswordUser?.name}"
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="new-password">New Password</Label>
                <Input
                  id="new-password"
                  type="password"
                  value={passwordData.password}
                  onChange={(e) => setPasswordData({ ...passwordData, password: e.target.value })}
                  placeholder="Enter new password"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && passwordData.password_confirmation) {
                      handleSavePassword();
                    }
                  }}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="confirm-new-password">Confirm Password</Label>
                <Input
                  id="confirm-new-password"
                  type="password"
                  value={passwordData.password_confirmation}
                  onChange={(e) => setPasswordData({ ...passwordData, password_confirmation: e.target.value })}
                  placeholder="Confirm new password"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && passwordData.password) {
                      handleSavePassword();
                    }
                  }}
                />
              </div>
            </div>
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => {
                  setChangePasswordModalOpen(false);
                  setChangingPasswordUser(null);
                  setPasswordData({
                    password: '',
                    password_confirmation: '',
                  });
                }}
              >
                Cancel
              </Button>
              <Button 
                type="button" 
                onClick={handleSavePassword}
                disabled={saving || !passwordData.password || !passwordData.password_confirmation}
              >
                {saving ? 'Changing...' : 'Change Password'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Assign Agents to Manager Modal */}
        <Dialog open={assignAgentsModalOpen} onOpenChange={setAssignAgentsModalOpen}>
          <DialogContent style={{ width: '500px', maxWidth: '90vw' }}>
            <DialogHeader>
              <DialogTitle>Assign Agents to Manager</DialogTitle>
              <DialogDescription>
                Select agents to assign to manager "{selectedManagerForAgents?.name}"
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label>Select Agents (Multiple)</Label>
                <div className="border rounded-md p-3 max-h-64 overflow-y-auto space-y-2">
                  {agentUsers.length === 0 ? (
                    <p className="text-sm text-gray-500">No agents available</p>
                  ) : (
                    agentUsers.map((agent) => (
                      <div key={agent.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`agent-${agent.id}`}
                          checked={selectedAgents.includes(agent.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedAgents([...selectedAgents, agent.id]);
                            } else {
                              setSelectedAgents(selectedAgents.filter(id => id !== agent.id));
                            }
                          }}
                        />
                        <label
                          htmlFor={`agent-${agent.id}`}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                        >
                          {agent.name} ({agent.email})
                        </label>
                      </div>
                    ))
                  )}
                </div>
                {selectedAgents.length > 0 && (
                  <p className="text-sm text-gray-600 mt-2">
                    {selectedAgents.length} agent(s) selected
                  </p>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setAssignAgentsModalOpen(false);
                  setSelectedManagerForAgents(null);
                  setSelectedAgents([]);
                }}
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleSaveAssignedAgents}
                disabled={assigningAgents || selectedAgents.length === 0}
              >
                {assigningAgents ? 'Assigning...' : 'Assign Agents'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* View Assigned Agents Modal */}
        <Dialog open={viewAssignedAgentsModalOpen} onOpenChange={setViewAssignedAgentsModalOpen}>
          <DialogContent style={{ width: '600px', maxWidth: '90vw' }}>
            <DialogHeader>
              <DialogTitle>Assigned Agents</DialogTitle>
              <DialogDescription>
                Agents assigned to manager "{viewingManagerAgents?.name}"
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              {loadingAssignedAgents ? (
                <div className="flex items-center justify-center h-32">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                </div>
              ) : assignedAgentsList.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No agents assigned to this manager
                </div>
              ) : (
                <div className="border rounded-md" style={{ borderColor: '#e4e4e4' }}>
                  <Table>
                    <TableHeader>
                      <TableRow style={{ borderColor: '#e4e4e4' }}>
                        <TableHead className="w-12" style={{ padding: '5px 15px' }}>#</TableHead>
                        <TableHead style={{ padding: '5px 15px' }}>Agent Name</TableHead>
                        <TableHead style={{ padding: '5px 15px' }}>Email</TableHead>
                        <TableHead className="w-24 text-center" style={{ padding: '5px 15px' }}>Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {assignedAgentsList.map((agent, index) => (
                        <TableRow key={agent.id} style={{ borderColor: '#e4e4e4' }}>
                          <TableCell className="font-medium" style={{ padding: '5px 15px' }}>{index + 1}</TableCell>
                          <TableCell style={{ padding: '5px 15px' }}>{agent.agent?.name || '-'}</TableCell>
                          <TableCell style={{ padding: '5px 15px' }}>{agent.agent?.email || '-'}</TableCell>
                          <TableCell className="text-center" style={{ padding: '5px 15px' }}>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => handleRemoveAgentClick(agent)}
                              title="Remove Agent"
                            >
                              <Trash2 className="h-4 w-4 text-red-600" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button
                type="button"
                onClick={() => {
                  setViewAssignedAgentsModalOpen(false);
                  setViewingManagerAgents(null);
                  setAssignedAgentsList([]);
                }}
              >
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Agent Assignment Confirmation */}
        <AlertDialog open={deleteAgentConfirmOpen} onOpenChange={setDeleteAgentConfirmOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Remove Agent Assignment</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to remove agent "{agentToDelete?.agent?.name}" from manager "{viewingManagerAgents?.name}"? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => {
                setDeleteAgentConfirmOpen(false);
                setAgentToDelete(null);
              }}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction onClick={confirmRemoveAgent} className="bg-red-600 hover:bg-red-700">
                Remove
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Edit Role Modal */}
        <Dialog open={editRoleModalOpen} onOpenChange={setEditRoleModalOpen}>
          <DialogContent style={{ width: '400px', maxWidth: '90vw' }}>
            <DialogHeader>
              <DialogTitle>Edit Role</DialogTitle>
              <DialogDescription>
                Update role information
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-role-name">Name</Label>
                <Input
                  id="edit-role-name"
                  value={roleFormData.name}
                  onChange={(e) => setRoleFormData({ ...roleFormData, name: e.target.value })}
                  placeholder="Enter role name"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-role-description">Description</Label>
                <Textarea
                  id="edit-role-description"
                  value={roleFormData.description}
                  onChange={(e) => setRoleFormData({ ...roleFormData, description: e.target.value })}
                  placeholder="Enter role description"
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setEditRoleModalOpen(false)}
              >
                Cancel
              </Button>
              <Button 
                type="button" 
                onClick={handleSaveEditRole}
                disabled={saving || !roleFormData.name}
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Brand Modal */}
        <Dialog open={editBrandModalOpen} onOpenChange={setEditBrandModalOpen}>
          <DialogPortal>
            <DialogOverlay style={{ backgroundColor: '#d0d0d09c' }} />
            <DialogContent 
              style={{ width: '400px', maxWidth: '90vw' }}
              className="fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-white p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg"
            >
              <DialogHeader>
                <DialogTitle>Edit Brand</DialogTitle>
                <DialogDescription>
                  Update brand information
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-brand-name">Brand Name</Label>
                  <Input
                    id="edit-brand-name"
                    value={editBrandName}
                    onChange={(e) => setEditBrandName(e.target.value)}
                    placeholder="Enter brand name"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleUpdateBrand();
                      }
                    }}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setEditBrandModalOpen(false);
                    setEditingBrand(null);
                    setEditBrandName('');
                  }}
                >
                  Cancel
                </Button>
                <Button 
                  type="button" 
                  onClick={handleUpdateBrand}
                  disabled={savingBrand || !editBrandName.trim()}
                >
                  {savingBrand ? 'Saving...' : 'Save Changes'}
                </Button>
              </DialogFooter>
              <button
                className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
                onClick={() => {
                  setEditBrandModalOpen(false);
                  setEditingBrand(null);
                  setEditBrandName('');
                }}
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Close</span>
              </button>
            </DialogContent>
          </DialogPortal>
        </Dialog>

        {/* Delete Brand Confirmation */}
        <AlertDialog open={deleteBrandModalOpen} onOpenChange={setDeleteBrandModalOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Brand</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete "{deletingBrand?.brand}"? 
                This action cannot be undone and will permanently remove the brand from your system.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => {
                setDeleteBrandModalOpen(false);
                setDeletingBrand(null);
              }}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction 
                onClick={confirmDeleteBrand}
                className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
                disabled={savingBrand}
              >
                {savingBrand ? 'Deleting...' : 'Delete Brand'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Edit Category Modal */}
        <Dialog open={editCategoryModalOpen} onOpenChange={setEditCategoryModalOpen}>
          <DialogPortal>
            <DialogOverlay style={{ backgroundColor: '#d0d0d09c' }} />
            <DialogContent 
              style={{ width: '400px', maxWidth: '90vw' }}
              className="fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-white p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg"
            >
              <DialogHeader>
                <DialogTitle>Edit Category</DialogTitle>
                <DialogDescription>
                  Update category information
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-category-brand">Brand</Label>
                  <Select 
                    value={editCategoryBrandId} 
                    onValueChange={(value) => setEditCategoryBrandId(value)}
                    disabled={savingCategory}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select brand" />
                    </SelectTrigger>
                    <SelectContent>
                      {allBrands.map((brand) => (
                        <SelectItem key={brand.id} value={brand.id.toString()}>
                          {brand.brand}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-category-name">Category Name</Label>
                  <Input
                    id="edit-category-name"
                    value={editCategoryName}
                    onChange={(e) => setEditCategoryName(e.target.value)}
                    placeholder="Enter category name"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleUpdateCategory();
                      }
                    }}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setEditCategoryModalOpen(false);
                    setEditingCategory(null);
                    setEditCategoryName('');
                    setEditCategoryBrandId('');
                  }}
                >
                  Cancel
                </Button>
                <Button 
                  type="button" 
                  onClick={handleUpdateCategory}
                  disabled={savingCategory || !editCategoryName.trim() || !editCategoryBrandId}
                >
                  {savingCategory ? 'Saving...' : 'Save Changes'}
                </Button>
              </DialogFooter>
              <button
                className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
                onClick={() => {
                  setEditCategoryModalOpen(false);
                  setEditingCategory(null);
                  setEditCategoryName('');
                  setEditCategoryBrandId('');
                }}
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Close</span>
              </button>
            </DialogContent>
          </DialogPortal>
        </Dialog>

        {/* Delete Category Confirmation */}
        <AlertDialog open={deleteCategoryModalOpen} onOpenChange={setDeleteCategoryModalOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Category</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete "{deletingCategory?.category}"? 
                This action cannot be undone and will permanently remove the category from your system.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => {
                setDeleteCategoryModalOpen(false);
                setDeletingCategory(null);
              }}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction 
                onClick={confirmDeleteCategory}
                className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
                disabled={savingCategory}
              >
                {savingCategory ? 'Deleting...' : 'Delete Category'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Edit Department Modal */}
        <Dialog open={editDepartmentModalOpen} onOpenChange={setEditDepartmentModalOpen}>
          <DialogPortal>
            <DialogOverlay style={{ backgroundColor: '#d0d0d09c' }} />
            <DialogContent 
              style={{ width: '400px', maxWidth: '90vw' }}
              className="fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-white p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg"
            >
              <DialogHeader>
                <DialogTitle>Edit Department</DialogTitle>
                <DialogDescription>
                  Update department information
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-department-name">Department Name</Label>
                  <Input
                    id="edit-department-name"
                    value={editDepartmentName}
                    onChange={(e) => setEditDepartmentName(e.target.value)}
                    placeholder="Enter department name"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        handleUpdateDepartment();
                      }
                    }}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setEditDepartmentModalOpen(false);
                    setEditingDepartment(null);
                    setEditDepartmentName('');
                  }}
                >
                  Cancel
                </Button>
                <Button 
                  type="button" 
                  onClick={handleUpdateDepartment}
                  disabled={savingDepartment || !editDepartmentName.trim()}
                >
                  {savingDepartment ? 'Saving...' : 'Save Changes'}
                </Button>
              </DialogFooter>
              <button
                className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
                onClick={() => {
                  setEditDepartmentModalOpen(false);
                  setEditingDepartment(null);
                  setEditDepartmentName('');
                }}
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Close</span>
              </button>
            </DialogContent>
          </DialogPortal>
        </Dialog>

        {/* Delete Department Confirmation */}
        <AlertDialog open={deleteDepartmentModalOpen} onOpenChange={setDeleteDepartmentModalOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Department</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete "{deletingDepartment?.department_name}"? 
                This action cannot be undone and will permanently remove the department from your system.
                {deletingDepartment && ' Note: This department must not have any agents assigned to it.'}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => {
                setDeleteDepartmentModalOpen(false);
                setDeletingDepartment(null);
              }}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction 
                onClick={confirmDeleteDepartment}
                className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
                disabled={savingDepartment}
              >
                {savingDepartment ? 'Deleting...' : 'Delete Department'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Edit Designation Modal */}
        <Dialog open={editDesignationModalOpen} onOpenChange={setEditDesignationModalOpen}>
          <DialogPortal>
            <DialogOverlay style={{ backgroundColor: '#d0d0d09c' }} />
            <DialogContent 
              style={{ width: '400px', maxWidth: '90vw' }}
              className="fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-white p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg"
            >
              <DialogHeader>
                <DialogTitle>Edit Designation</DialogTitle>
                <DialogDescription>
                  Update designation information
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-designation-name">Designation Name</Label>
                  <Input
                    id="edit-designation-name"
                    value={editDesignationName}
                    onChange={(e) => setEditDesignationName(e.target.value)}
                    placeholder="Enter designation name"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleUpdateDesignation();
                      }
                    }}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setEditDesignationModalOpen(false);
                    setEditingDesignation(null);
                    setEditDesignationName('');
                  }}
                >
                  Cancel
                </Button>
                <Button 
                  type="button" 
                  onClick={handleUpdateDesignation}
                  disabled={savingDesignation || !editDesignationName.trim()}
                >
                  {savingDesignation ? 'Saving...' : 'Save Changes'}
                </Button>
              </DialogFooter>
              <button
                className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
                onClick={() => {
                  setEditDesignationModalOpen(false);
                  setEditingDesignation(null);
                  setEditDesignationName('');
                }}
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Close</span>
              </button>
            </DialogContent>
          </DialogPortal>
        </Dialog>

        {/* Delete Designation Confirmation */}
        <AlertDialog open={deleteDesignationModalOpen} onOpenChange={setDeleteDesignationModalOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Designation</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete "{deletingDesignation?.designation_name}"? 
                This action cannot be undone and will permanently remove the designation from your system.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => {
                setDeleteDesignationModalOpen(false);
                setDeletingDesignation(null);
              }}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction 
                onClick={confirmDeleteDesignation}
                className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
                disabled={savingDesignation}
              >
                {savingDesignation ? 'Deleting...' : 'Delete Designation'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        
        {/* Edit Ticket Label Modal */}
        <Dialog open={editTicketLabelModalOpen} onOpenChange={setEditTicketLabelModalOpen}>
          <DialogContent style={{ width: '400px', maxWidth: '90vw' }}>
            <DialogHeader>
              <DialogTitle>Edit Ticket Label</DialogTitle>
              <DialogDescription>
                Update the ticket label details below.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-ticket-label-name">Label Name</Label>
                <Input
                  id="edit-ticket-label-name"
                  value={editTicketLabelName}
                  onChange={(e) => setEditTicketLabelName(e.target.value)}
                  disabled={savingTicketLabel}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-ticket-label-color">Color</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="edit-ticket-label-color"
                    type="color"
                    value={editTicketLabelColor}
                    onChange={(e) => setEditTicketLabelColor(e.target.value)}
                    disabled={savingTicketLabel}
                    className="w-full h-10 cursor-pointer"
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => {
                  setEditTicketLabelModalOpen(false);
                  setEditingTicketLabel(null);
                  setEditTicketLabelName('');
                  setEditTicketLabelColor('#3B82F6');
                }}
                disabled={savingTicketLabel}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleUpdateTicketLabel}
                disabled={savingTicketLabel || !editTicketLabelName.trim()}
                className="bg-black hover:bg-gray-800 text-white"
              >
                {savingTicketLabel ? 'Updating...' : 'Update Label'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        {/* Delete Ticket Label Modal */}
        <AlertDialog open={deleteTicketLabelModalOpen} onOpenChange={setDeleteTicketLabelModalOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Ticket Label</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete "{deletingTicketLabel?.label_name}"? 
                This action cannot be undone and will permanently remove the ticket label from your system.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => {
                setDeleteTicketLabelModalOpen(false);
                setDeletingTicketLabel(null);
              }}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction 
                onClick={confirmDeleteTicketLabel}
                className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
                disabled={savingTicketLabel}
              >
                {savingTicketLabel ? 'Deleting...' : 'Delete Label'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        
        {/* Edit Additional Field Modal */}
        <Dialog open={editAdditionalFieldModalOpen} onOpenChange={setEditAdditionalFieldModalOpen}>
          <DialogContent style={{ width: '500px', maxWidth: '90vw' }}>
            <DialogHeader>
              <DialogTitle>Edit Additional Field</DialogTitle>
              <DialogDescription>
                Update the additional field details below.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-field-title">Field Title</Label>
                <Input
                  id="edit-field-title"
                  value={editFieldTitle}
                  onChange={(e) => setEditFieldTitle(e.target.value)}
                  disabled={savingAdditionalField}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-field-name">Field Name</Label>
                <Input
                  id="edit-field-name"
                  value={editFieldName}
                  onChange={(e) => setEditFieldName(e.target.value.replace(/\s/g, '_'))}
                  disabled={savingAdditionalField}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-field-type">Field Type</Label>
                <Select 
                  value={editFieldType} 
                  onValueChange={setEditFieldType}
                  disabled={savingAdditionalField}
                >
                  <SelectTrigger id="edit-field-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">SELECT</SelectItem>
                    <SelectItem value="2">Text</SelectItem>
                    <SelectItem value="3">Date</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="edit-field-required"
                    checked={editFieldMandatory}
                    onCheckedChange={(checked) => setEditFieldMandatory(checked as boolean)}
                    disabled={savingAdditionalField}
                  />
                  <Label htmlFor="edit-field-required" className="text-sm font-normal cursor-pointer">
                    Required
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="edit-field-show-filter"
                    checked={editFieldShowFilter}
                    onCheckedChange={(checked) => setEditFieldShowFilter(checked as boolean)}
                    disabled={savingAdditionalField}
                  />
                  <Label htmlFor="edit-field-show-filter" className="text-sm font-normal cursor-pointer">
                    Show in Filter
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="edit-field-show-list"
                    checked={editFieldShowList}
                    onCheckedChange={(checked) => setEditFieldShowList(checked as boolean)}
                    disabled={savingAdditionalField}
                  />
                  <Label htmlFor="edit-field-show-list" className="text-sm font-normal cursor-pointer">
                    Show in List
                  </Label>
                </div>
              </div>
              {editFieldType === '1' && (
                <>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="edit-field-multiselect"
                      checked={editFieldMultiselect}
                      onCheckedChange={(checked) => setEditFieldMultiselect(checked as boolean)}
                      disabled={savingAdditionalField}
                    />
                    <Label htmlFor="edit-field-multiselect" className="text-sm font-normal cursor-pointer">
                      Multiselect
                    </Label>
                  </div>
                  <div className="grid gap-2">
                    <Label>Enter Values for SELECT</Label>
                    <div className="space-y-2">
                    {editFieldValues.map((value, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <Input
                          placeholder="value"
                          value={value}
                          onChange={(e) => handleEditFieldValueChange(index, e.target.value)}
                          disabled={savingAdditionalField}
                        />
                        {editFieldValues.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveEditFieldValue(index)}
                            disabled={savingAdditionalField}
                            className="p-2"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                        {index === editFieldValues.length - 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={handleAddEditFieldValue}
                            disabled={savingAdditionalField}
                            className="p-2"
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                    </div>
                  </div>
                </>
              )}
            </div>
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => {
                  setEditAdditionalFieldModalOpen(false);
                  setEditingAdditionalField(null);
                  setEditFieldTitle('');
                  setEditFieldName('');
                  setEditFieldType('1');
                  setEditFieldMandatory(false);
                  setEditFieldShowFilter(false);
                  setEditFieldShowList(false);
                  setEditFieldMultiselect(false);
                  setEditFieldValues(['']);
                }}
                disabled={savingAdditionalField}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleUpdateAdditionalField}
                disabled={savingAdditionalField || !editFieldTitle.trim() || !editFieldName.trim()}
                className="bg-black hover:bg-gray-800 text-white"
              >
                {savingAdditionalField ? 'Updating...' : 'Update Field'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        {/* Delete Additional Field Modal */}
        <AlertDialog open={deleteAdditionalFieldModalOpen} onOpenChange={setDeleteAdditionalFieldModalOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Additional Field</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete "{deletingAdditionalField?.title}"? 
                This action cannot be undone and will permanently remove the additional field from your system.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => {
                setDeleteAdditionalFieldModalOpen(false);
                setDeletingAdditionalField(null);
              }}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction 
                onClick={confirmDeleteAdditionalField}
                className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
                disabled={savingAdditionalField}
              >
                {savingAdditionalField ? 'Deleting...' : 'Delete Field'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Delete QR Code Modal */}
        <AlertDialog open={deleteQRCodeModalOpen} onOpenChange={setDeleteQRCodeModalOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete QR Code</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this QR code for "{deletingQRCode?.web_link}"? 
                This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteQRCode}
                className="bg-red-600 hover:bg-red-700"
              >
                Delete QR Code
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Message Settings Modal */}
        <Dialog open={messageModalOpen} onOpenChange={setMessageModalOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>
                {editingMessage ? 'Edit Whatsapp Setting' : 'Add Whatsapp Setting'}
              </DialogTitle>
              <DialogDescription>
                Configure WhatsApp templates and API settings for automated messaging.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="vendor-name">Vendor Name *</Label>
                <Input
                  id="vendor-name"
                  value={messageFormData.vendor_name}
                  onChange={(e) => setMessageFormData({ ...messageFormData, vendor_name: e.target.value })}
                  placeholder="Enter vendor name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="whatsapp-api">WhatsApp API URL *</Label>
                <Input
                  id="whatsapp-api"
                  value={messageFormData.whatsapp_api}
                  onChange={(e) => setMessageFormData({ ...messageFormData, whatsapp_api: e.target.value })}
                  placeholder="https://api.whatsapp.com/..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="token">
                  API Token
                  {editingMessage?.masked_token && (
                    <span className="ml-2 text-xs text-gray-500">
                      (Current: {editingMessage.masked_token})
                    </span>
                  )}
                </Label>
                <Input
                  id="token"
                  type="text"
                  value={messageFormData.api_token}
                  onChange={(e) => setMessageFormData({ ...messageFormData, api_token: e.target.value })}
                  placeholder={editingMessage ? "Leave blank to keep existing token" : "Enter API token"}
                />
                {editingMessage && (
                  <p className="text-xs text-gray-500">
                    For security, the current token is hidden. Enter a new value to update, or leave blank to keep existing.
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone-number-id">Phone Number ID</Label>
                <Input
                  id="phone-number-id"
                  type="text"
                  value={messageFormData.phone_number_id}
                  onChange={(e) => setMessageFormData({ ...messageFormData, phone_number_id: e.target.value })}
                  placeholder="Enter phone number ID"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="message-status"
                  checked={messageFormData.status}
                  onCheckedChange={(checked) => setMessageFormData({ ...messageFormData, status: checked as boolean })}
                />
                <Label htmlFor="message-status" className="cursor-pointer">
                  Active (Enable this WhatsApp API)
                </Label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setMessageModalOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={() => handleSaveNotificationSetting()}
                className="bg-black hover:bg-gray-800"
              >
                {editingMessage ? 'Update' : 'Add'} Setting
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Message Modal */}
        <AlertDialog open={deleteMessageModalOpen} onOpenChange={setDeleteMessageModalOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Whatsapp Setting</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete the WhatsApp setting for "{deletingMessage?.vendor_name || 'this vendor'}"?
                This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => handleDeleteNotificationSetting()}
                className="bg-red-600 hover:bg-red-700"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* SMS Settings Modal (Add/Edit) */}
        <Dialog open={smsModalOpen} onOpenChange={setSmsModalOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>
                {editingSms ? 'Edit SMS Setting' : 'Add SMS Setting'}
              </DialogTitle>
              <DialogDescription>
                Configure SMS API settings for automated messaging.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="sms-vendor-name">Vendor Name *</Label>
                <Input
                  id="sms-vendor-name"
                  value={smsFormData.vendor_name}
                  onChange={(e) => setSmsFormData({ ...smsFormData, vendor_name: e.target.value })}
                  placeholder="Enter vendor name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="sms-api">SMS API URL *</Label>
                <Input
                  id="sms-api"
                  value={smsFormData.sms_api}
                  onChange={(e) => setSmsFormData({ ...smsFormData, sms_api: e.target.value })}
                  placeholder="https://api.smsprovider.com/..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="sms-token">
                  API Token
                  {editingSms?.masked_token && (
                    <span className="ml-2 text-xs text-gray-500">
                      (Current: {editingSms.masked_token})
                    </span>
                  )}
                </Label>
                <Input
                  id="sms-token"
                  type="text"
                  value={smsFormData.api_token}
                  onChange={(e) => setSmsFormData({ ...smsFormData, api_token: e.target.value })}
                  placeholder={editingSms ? "Leave blank to keep existing token" : "Enter API token"}
                />
                {editingSms && (
                  <p className="text-xs text-gray-500">
                    For security, the current token is hidden. Enter a new value to update, or leave blank to keep existing.
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="sender-id">Sender ID</Label>
                <Input
                  id="sender-id"
                  type="text"
                  value={smsFormData.sender_id}
                  onChange={(e) => setSmsFormData({ ...smsFormData, sender_id: e.target.value })}
                  placeholder="Enter sender ID"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="sms-status"
                  checked={smsFormData.status}
                  onCheckedChange={(checked) => setSmsFormData({ ...smsFormData, status: checked as boolean })}
                />
                <Label htmlFor="sms-status" className="cursor-pointer">
                  Active (Enable this SMS API)
                </Label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setSmsModalOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={() => handleSaveSms()}
                className="bg-black hover:bg-gray-800"
              >
                {editingSms ? 'Update' : 'Add'} Setting
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete SMS Modal */}
        <AlertDialog open={deleteSmsModalOpen} onOpenChange={setDeleteSmsModalOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete SMS Setting</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete the SMS setting for "{deletingSms?.vendor_name || 'this vendor'}"?
                This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => handleDeleteSms()}
                className="bg-red-600 hover:bg-red-700"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Edit Branch Modal */}
        <Dialog open={editBranchModalOpen} onOpenChange={setEditBranchModalOpen}>
          <DialogContent style={{ width: '400px', maxWidth: '90vw' }}>
            <DialogHeader>
              <DialogTitle>Edit Branch</DialogTitle>
              <DialogDescription>
                Update branch information
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-branch-name">Branch Name</Label>
                <Input
                  id="edit-branch-name"
                  value={editBranchFormData.branch_name}
                  onChange={(e) => setEditBranchFormData({ ...editBranchFormData, branch_name: e.target.value })}
                  placeholder="Enter branch name"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="edit-branch-address">Address</Label>
                <Textarea
                  id="edit-branch-address"
                  value={editBranchFormData.address}
                  onChange={(e) => setEditBranchFormData({ ...editBranchFormData, address: e.target.value })}
                  placeholder="Enter branch address"
                  className="min-h-[80px]"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="edit-branch-country-code">Country Code</Label>
                <Select
                  value={editBranchFormData.country_code}
                  onValueChange={(value) => setEditBranchFormData({ ...editBranchFormData, country_code: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select country code" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[300px]">
                    {COUNTRY_CODES.map((country) => (
                      <SelectItem key={country.code} value={country.code}>
                        <span className="flex items-center gap-2">
                          <span>{country.flag}</span>
                          <span>{country.name}</span>
                          <span className="text-gray-500">({country.code})</span>
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="edit-branch-customer-care">Customer Care Number</Label>
                <Input
                  id="edit-branch-customer-care"
                  value={editBranchFormData.customer_care_number}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^0-9]/g, '');
                    if (value.length <= 15) {
                      setEditBranchFormData({ ...editBranchFormData, customer_care_number: value });
                    }
                  }}
                  placeholder="Enter customer care number"
                  maxLength={15}
                />
              </div>
            </div>
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => {
                  setEditBranchModalOpen(false);
                  setEditingBranch(null);
                  setEditBranchFormData({
                    branch_name: '',
                    address: '',
                    country_code: '+91',
                    customer_care_number: ''
                  });
                }}
              >
                Cancel
              </Button>
              <Button 
                type="button" 
                onClick={handleUpdateBranch}
                disabled={savingBranch || !editBranchFormData.branch_name}
              >
                {savingBranch ? 'Saving...' : 'Save Changes'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Branch Confirmation Modal */}
        <AlertDialog open={deleteBranchModalOpen} onOpenChange={setDeleteBranchModalOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete the branch "{deletingBranch?.branch_name}"?
                This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmDeleteBranch}
                disabled={savingBranch}
                className="bg-red-600 hover:bg-red-700"
              >
                {savingBranch ? 'Deleting...' : 'Delete'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Telegram Credentials Missing Alert */}
        <AlertDialog open={telegramCredentialsAlertOpen} onOpenChange={setTelegramCredentialsAlertOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2">
                <Send className="h-5 w-5 text-orange-500" />
                Telegram Configuration Required
              </AlertDialogTitle>
              <AlertDialogDescription className="text-left">
                TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID not added. Please add these values in .env file.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogAction
                onClick={() => setTelegramCredentialsAlertOpen(false)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                OK
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Edit Company Logo Modal */}
        <Dialog open={editLogoModalOpen} onOpenChange={setEditLogoModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Company Logo</DialogTitle>
              <DialogDescription>
                Update the company logo information
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-logo-name" className="text-sm font-medium">Logo Name</Label>
                <Input
                  id="edit-logo-name"
                  type="text"
                  placeholder="Enter logo name (optional)"
                  value={logoFormData.name}
                  onChange={(e) => handleLogoFormChange('name', e.target.value)}
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="edit-logo-type" className="text-sm font-medium">Type</Label>
                <Select
                  value={logoFormData.type}
                  onValueChange={(value: 'Logo' | 'Favicon') => handleLogoFormChange('type', value)}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Logo">Logo</SelectItem>
                    <SelectItem value="Favicon">Favicon</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="edit-logo-file" className="text-sm font-medium">Logo Image</Label>
                <Input
                  id="edit-logo-file"
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    handleLogoFormChange('logo_image', file || null);
                  }}
                  className="mt-1"
                />
                <p className="text-xs text-gray-500 mt-1">Leave empty to keep current image. Max size: 2MB. Formats: JPG, PNG, GIF, SVG</p>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="edit-logo-active"
                  checked={logoFormData.is_active}
                  onCheckedChange={(checked) => handleLogoFormChange('is_active', checked)}
                />
                <Label htmlFor="edit-logo-active" className="text-sm">Set as Active Logo</Label>
              </div>
              <p className="text-xs text-gray-500 mt-1">Note: Only one logo of each type can be active at a time. Setting this as active will deactivate all other logos of the same type.</p>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditLogoModalOpen(false)} disabled={savingLogo}>
                Cancel
              </Button>
              <Button onClick={handleUpdateLogo} disabled={savingLogo} className="bg-blue-600 hover:bg-blue-700">
                {savingLogo ? 'Updating...' : 'Update Logo'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Company Logo Confirmation Modal */}
        <AlertDialog open={deleteLogoModalOpen} onOpenChange={setDeleteLogoModalOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this company logo "{deletingLogo?.name || 'Unnamed'}"?
                This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmDeleteLogo}
                disabled={savingLogo}
                className="bg-red-600 hover:bg-red-700"
              >
                {savingLogo ? 'Deleting...' : 'Delete'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </DashboardLayout>
  );
}