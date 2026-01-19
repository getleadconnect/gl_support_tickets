import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Search } from 'lucide-react';

interface Country {
  code: string;
  name: string;
  phoneCode: string;
  flag: string;
}

interface CountryCodePickerProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

const countries: Country[] = [
  { code: 'in', name: 'India', phoneCode: '+91', flag: '🇮🇳' },
  { code: 'us', name: 'United States', phoneCode: '+1', flag: '🇺🇸' },
  { code: 'gb', name: 'United Kingdom', phoneCode: '+44', flag: '🇬🇧' },
  { code: 'ca', name: 'Canada', phoneCode: '+1', flag: '🇨🇦' },
  { code: 'au', name: 'Australia', phoneCode: '+61', flag: '🇦🇺' },
  { code: 'de', name: 'Germany', phoneCode: '+49', flag: '🇩🇪' },
  { code: 'fr', name: 'France', phoneCode: '+33', flag: '🇫🇷' },
  { code: 'jp', name: 'Japan', phoneCode: '+81', flag: '🇯🇵' },
  { code: 'cn', name: 'China', phoneCode: '+86', flag: '🇨🇳' },
  { code: 'br', name: 'Brazil', phoneCode: '+55', flag: '🇧🇷' },
  { code: 'ru', name: 'Russia', phoneCode: '+7', flag: '🇷🇺' },
  { code: 'mx', name: 'Mexico', phoneCode: '+52', flag: '🇲🇽' },
  { code: 'es', name: 'Spain', phoneCode: '+34', flag: '🇪🇸' },
  { code: 'it', name: 'Italy', phoneCode: '+39', flag: '🇮🇹' },
  { code: 'kr', name: 'South Korea', phoneCode: '+82', flag: '🇰🇷' },
  { code: 'nl', name: 'Netherlands', phoneCode: '+31', flag: '🇳🇱' },
  { code: 'sa', name: 'Saudi Arabia', phoneCode: '+966', flag: '🇸🇦' },
  { code: 'ae', name: 'United Arab Emirates', phoneCode: '+971', flag: '🇦🇪' },
  { code: 'sg', name: 'Singapore', phoneCode: '+65', flag: '🇸🇬' },
  { code: 'my', name: 'Malaysia', phoneCode: '+60', flag: '🇲🇾' },
  { code: 'id', name: 'Indonesia', phoneCode: '+62', flag: '🇮🇩' },
  { code: 'th', name: 'Thailand', phoneCode: '+66', flag: '🇹🇭' },
  { code: 'vn', name: 'Vietnam', phoneCode: '+84', flag: '🇻🇳' },
  { code: 'ph', name: 'Philippines', phoneCode: '+63', flag: '🇵🇭' },
  { code: 'pk', name: 'Pakistan', phoneCode: '+92', flag: '🇵🇰' },
  { code: 'bd', name: 'Bangladesh', phoneCode: '+880', flag: '🇧🇩' },
  { code: 'lk', name: 'Sri Lanka', phoneCode: '+94', flag: '🇱🇰' },
  { code: 'np', name: 'Nepal', phoneCode: '+977', flag: '🇳🇵' },
  { code: 'af', name: 'Afghanistan', phoneCode: '+93', flag: '🇦🇫' },
  { code: 'za', name: 'South Africa', phoneCode: '+27', flag: '🇿🇦' },
  { code: 'eg', name: 'Egypt', phoneCode: '+20', flag: '🇪🇬' },
  { code: 'ke', name: 'Kenya', phoneCode: '+254', flag: '🇰🇪' },
  { code: 'ng', name: 'Nigeria', phoneCode: '+234', flag: '🇳🇬' },
  { code: 'gh', name: 'Ghana', phoneCode: '+233', flag: '🇬🇭' },
  { code: 'et', name: 'Ethiopia', phoneCode: '+251', flag: '🇪🇹' },
  { code: 'ug', name: 'Uganda', phoneCode: '+256', flag: '🇺🇬' },
  { code: 'tz', name: 'Tanzania', phoneCode: '+255', flag: '🇹🇿' },
  { code: 'ar', name: 'Argentina', phoneCode: '+54', flag: '🇦🇷' },
  { code: 'cl', name: 'Chile', phoneCode: '+56', flag: '🇨🇱' },
  { code: 'co', name: 'Colombia', phoneCode: '+57', flag: '🇨🇴' },
  { code: 'pe', name: 'Peru', phoneCode: '+51', flag: '🇵🇪' },
  { code: 've', name: 'Venezuela', phoneCode: '+58', flag: '🇻🇪' },
  { code: 'nz', name: 'New Zealand', phoneCode: '+64', flag: '🇳🇿' },
  { code: 'at', name: 'Austria', phoneCode: '+43', flag: '🇦🇹' },
  { code: 'be', name: 'Belgium', phoneCode: '+32', flag: '🇧🇪' },
  { code: 'ch', name: 'Switzerland', phoneCode: '+41', flag: '🇨🇭' },
  { code: 'dk', name: 'Denmark', phoneCode: '+45', flag: '🇩🇰' },
  { code: 'fi', name: 'Finland', phoneCode: '+358', flag: '🇫🇮' },
  { code: 'gr', name: 'Greece', phoneCode: '+30', flag: '🇬🇷' },
  { code: 'ie', name: 'Ireland', phoneCode: '+353', flag: '🇮🇪' },
  { code: 'no', name: 'Norway', phoneCode: '+47', flag: '🇳🇴' },
  { code: 'pl', name: 'Poland', phoneCode: '+48', flag: '🇵🇱' },
  { code: 'pt', name: 'Portugal', phoneCode: '+351', flag: '🇵🇹' },
  { code: 'se', name: 'Sweden', phoneCode: '+46', flag: '🇸🇪' },
  { code: 'tr', name: 'Turkey', phoneCode: '+90', flag: '🇹🇷' },
  { code: 'ua', name: 'Ukraine', phoneCode: '+380', flag: '🇺🇦' },
  { code: 'il', name: 'Israel', phoneCode: '+972', flag: '🇮🇱' },
  { code: 'kw', name: 'Kuwait', phoneCode: '+965', flag: '🇰🇼' },
  { code: 'qa', name: 'Qatar', phoneCode: '+974', flag: '🇶🇦' },
  { code: 'om', name: 'Oman', phoneCode: '+968', flag: '🇴🇲' },
  { code: 'bh', name: 'Bahrain', phoneCode: '+973', flag: '🇧🇭' },
  { code: 'jo', name: 'Jordan', phoneCode: '+962', flag: '🇯🇴' },
  { code: 'lb', name: 'Lebanon', phoneCode: '+961', flag: '🇱🇧' },
  { code: 'iq', name: 'Iraq', phoneCode: '+964', flag: '🇮🇶' },
  { code: 'ir', name: 'Iran', phoneCode: '+98', flag: '🇮🇷' },
  { code: 'sy', name: 'Syria', phoneCode: '+963', flag: '🇸🇾' },
  { code: 'ye', name: 'Yemen', phoneCode: '+967', flag: '🇾🇪' },
  { code: 'dz', name: 'Algeria', phoneCode: '+213', flag: '🇩🇿' },
  { code: 'ma', name: 'Morocco', phoneCode: '+212', flag: '🇲🇦' },
  { code: 'tn', name: 'Tunisia', phoneCode: '+216', flag: '🇹🇳' },
  { code: 'ly', name: 'Libya', phoneCode: '+218', flag: '🇱🇾' },
  { code: 'hk', name: 'Hong Kong', phoneCode: '+852', flag: '🇭🇰' },
  { code: 'tw', name: 'Taiwan', phoneCode: '+886', flag: '🇹🇼' },
  { code: 'mo', name: 'Macao', phoneCode: '+853', flag: '🇲🇴' },
];

export function CountryCodePicker({ value, onChange, className }: CountryCodePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selectedCountry = countries.find(c => c.phoneCode === value) || countries[0];

  const filteredCountries = countries.filter(country =>
    country.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    country.phoneCode.includes(searchTerm)
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSelect = (country: Country) => {
    onChange(country.phoneCode);
    setIsOpen(false);
    setSearchTerm('');
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center justify-between px-3 border rounded-md bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`}
        style={{ height: '40px' }}
      >
        <div className="flex items-center gap-2">
          <span className="text-lg">{selectedCountry.flag}</span>
          <span className="text-sm font-medium">{selectedCountry.phoneCode}</span>
        </div>
        <ChevronDown className="h-4 w-4 text-gray-500" />
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-1 w-72 bg-white border border-gray-200 rounded-md shadow-lg">
          <div className="p-2 border-b">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                ref={inputRef}
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search country..."
                className="w-full pl-9 pr-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="max-h-60 overflow-y-auto">
            {filteredCountries.map((country) => (
              <button
                key={country.code}
                type="button"
                onClick={() => handleSelect(country)}
                className="w-full flex items-center gap-3 px-3 py-2 hover:bg-gray-100 transition-colors"
              >
                <span className="text-lg">{country.flag}</span>
                <span className="flex-1 text-left text-sm">{country.name}</span>
                <span className="text-sm text-gray-500">{country.phoneCode}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}