/*!
 * jQuery Country Code Picker Plugin
 * https://github.com/rgnldo/jquery-ccpicker
 * Version: 1.0.0
 */

(function($){
    $.fn.ccPicker = function(options){
        var settings = $.extend({
            countryCode: "us",
            dialCodeFieldName: "phoneCode",
            dataUrl: "/js/jquery.ccpicker.data.js",
        }, options);

        var countriesData = [
            { code: "af", name: "Afghanistan", phoneCode: "+93" },
            { code: "al", name: "Albania", phoneCode: "+355" },
            { code: "dz", name: "Algeria", phoneCode: "+213" },
            { code: "as", name: "American Samoa", phoneCode: "+1684" },
            { code: "ad", name: "Andorra", phoneCode: "+376" },
            { code: "ao", name: "Angola", phoneCode: "+244" },
            { code: "ai", name: "Anguilla", phoneCode: "+1264" },
            { code: "ar", name: "Argentina", phoneCode: "+54" },
            { code: "am", name: "Armenia", phoneCode: "+374" },
            { code: "aw", name: "Aruba", phoneCode: "+297" },
            { code: "au", name: "Australia", phoneCode: "+61" },
            { code: "at", name: "Austria", phoneCode: "+43" },
            { code: "az", name: "Azerbaijan", phoneCode: "+994" },
            { code: "bs", name: "Bahamas", phoneCode: "+1242" },
            { code: "bh", name: "Bahrain", phoneCode: "+973" },
            { code: "bd", name: "Bangladesh", phoneCode: "+880" },
            { code: "bb", name: "Barbados", phoneCode: "+1246" },
            { code: "by", name: "Belarus", phoneCode: "+375" },
            { code: "be", name: "Belgium", phoneCode: "+32" },
            { code: "bz", name: "Belize", phoneCode: "+501" },
            { code: "bj", name: "Benin", phoneCode: "+229" },
            { code: "bm", name: "Bermuda", phoneCode: "+1441" },
            { code: "bt", name: "Bhutan", phoneCode: "+975" },
            { code: "bo", name: "Bolivia", phoneCode: "+591" },
            { code: "ba", name: "Bosnia and Herzegovina", phoneCode: "+387" },
            { code: "bw", name: "Botswana", phoneCode: "+267" },
            { code: "br", name: "Brazil", phoneCode: "+55" },
            { code: "bn", name: "Brunei", phoneCode: "+673" },
            { code: "bg", name: "Bulgaria", phoneCode: "+359" },
            { code: "bf", name: "Burkina Faso", phoneCode: "+226" },
            { code: "bi", name: "Burundi", phoneCode: "+257" },
            { code: "kh", name: "Cambodia", phoneCode: "+855" },
            { code: "cm", name: "Cameroon", phoneCode: "+237" },
            { code: "ca", name: "Canada", phoneCode: "+1" },
            { code: "cv", name: "Cape Verde", phoneCode: "+238" },
            { code: "ky", name: "Cayman Islands", phoneCode: "+1345" },
            { code: "cf", name: "Central African Republic", phoneCode: "+236" },
            { code: "td", name: "Chad", phoneCode: "+235" },
            { code: "cl", name: "Chile", phoneCode: "+56" },
            { code: "cn", name: "China", phoneCode: "+86" },
            { code: "co", name: "Colombia", phoneCode: "+57" },
            { code: "km", name: "Comoros", phoneCode: "+269" },
            { code: "cg", name: "Congo", phoneCode: "+242" },
            { code: "cd", name: "Congo, Democratic Republic", phoneCode: "+243" },
            { code: "ck", name: "Cook Islands", phoneCode: "+682" },
            { code: "cr", name: "Costa Rica", phoneCode: "+506" },
            { code: "ci", name: "Cote d'Ivoire", phoneCode: "+225" },
            { code: "hr", name: "Croatia", phoneCode: "+385" },
            { code: "cu", name: "Cuba", phoneCode: "+53" },
            { code: "cy", name: "Cyprus", phoneCode: "+357" },
            { code: "cz", name: "Czech Republic", phoneCode: "+420" },
            { code: "dk", name: "Denmark", phoneCode: "+45" },
            { code: "dj", name: "Djibouti", phoneCode: "+253" },
            { code: "dm", name: "Dominica", phoneCode: "+1767" },
            { code: "do", name: "Dominican Republic", phoneCode: "+1" },
            { code: "ec", name: "Ecuador", phoneCode: "+593" },
            { code: "eg", name: "Egypt", phoneCode: "+20" },
            { code: "sv", name: "El Salvador", phoneCode: "+503" },
            { code: "gq", name: "Equatorial Guinea", phoneCode: "+240" },
            { code: "er", name: "Eritrea", phoneCode: "+291" },
            { code: "ee", name: "Estonia", phoneCode: "+372" },
            { code: "et", name: "Ethiopia", phoneCode: "+251" },
            { code: "fj", name: "Fiji", phoneCode: "+679" },
            { code: "fi", name: "Finland", phoneCode: "+358" },
            { code: "fr", name: "France", phoneCode: "+33" },
            { code: "ga", name: "Gabon", phoneCode: "+241" },
            { code: "gm", name: "Gambia", phoneCode: "+220" },
            { code: "ge", name: "Georgia", phoneCode: "+995" },
            { code: "de", name: "Germany", phoneCode: "+49" },
            { code: "gh", name: "Ghana", phoneCode: "+233" },
            { code: "gi", name: "Gibraltar", phoneCode: "+350" },
            { code: "gr", name: "Greece", phoneCode: "+30" },
            { code: "gl", name: "Greenland", phoneCode: "+299" },
            { code: "gd", name: "Grenada", phoneCode: "+1473" },
            { code: "gu", name: "Guam", phoneCode: "+1671" },
            { code: "gt", name: "Guatemala", phoneCode: "+502" },
            { code: "gn", name: "Guinea", phoneCode: "+224" },
            { code: "gw", name: "Guinea-Bissau", phoneCode: "+245" },
            { code: "gy", name: "Guyana", phoneCode: "+592" },
            { code: "ht", name: "Haiti", phoneCode: "+509" },
            { code: "hn", name: "Honduras", phoneCode: "+504" },
            { code: "hk", name: "Hong Kong", phoneCode: "+852" },
            { code: "hu", name: "Hungary", phoneCode: "+36" },
            { code: "is", name: "Iceland", phoneCode: "+354" },
            { code: "in", name: "India", phoneCode: "+91" },
            { code: "id", name: "Indonesia", phoneCode: "+62" },
            { code: "ir", name: "Iran", phoneCode: "+98" },
            { code: "iq", name: "Iraq", phoneCode: "+964" },
            { code: "ie", name: "Ireland", phoneCode: "+353" },
            { code: "il", name: "Israel", phoneCode: "+972" },
            { code: "it", name: "Italy", phoneCode: "+39" },
            { code: "jm", name: "Jamaica", phoneCode: "+1876" },
            { code: "jp", name: "Japan", phoneCode: "+81" },
            { code: "jo", name: "Jordan", phoneCode: "+962" },
            { code: "kz", name: "Kazakhstan", phoneCode: "+7" },
            { code: "ke", name: "Kenya", phoneCode: "+254" },
            { code: "ki", name: "Kiribati", phoneCode: "+686" },
            { code: "kp", name: "North Korea", phoneCode: "+850" },
            { code: "kr", name: "South Korea", phoneCode: "+82" },
            { code: "kw", name: "Kuwait", phoneCode: "+965" },
            { code: "kg", name: "Kyrgyzstan", phoneCode: "+996" },
            { code: "la", name: "Laos", phoneCode: "+856" },
            { code: "lv", name: "Latvia", phoneCode: "+371" },
            { code: "lb", name: "Lebanon", phoneCode: "+961" },
            { code: "ls", name: "Lesotho", phoneCode: "+266" },
            { code: "lr", name: "Liberia", phoneCode: "+231" },
            { code: "ly", name: "Libya", phoneCode: "+218" },
            { code: "li", name: "Liechtenstein", phoneCode: "+423" },
            { code: "lt", name: "Lithuania", phoneCode: "+370" },
            { code: "lu", name: "Luxembourg", phoneCode: "+352" },
            { code: "mo", name: "Macao", phoneCode: "+853" },
            { code: "mk", name: "Macedonia", phoneCode: "+389" },
            { code: "mg", name: "Madagascar", phoneCode: "+261" },
            { code: "mw", name: "Malawi", phoneCode: "+265" },
            { code: "my", name: "Malaysia", phoneCode: "+60" },
            { code: "mv", name: "Maldives", phoneCode: "+960" },
            { code: "ml", name: "Mali", phoneCode: "+223" },
            { code: "mt", name: "Malta", phoneCode: "+356" },
            { code: "mh", name: "Marshall Islands", phoneCode: "+692" },
            { code: "mr", name: "Mauritania", phoneCode: "+222" },
            { code: "mu", name: "Mauritius", phoneCode: "+230" },
            { code: "mx", name: "Mexico", phoneCode: "+52" },
            { code: "fm", name: "Micronesia", phoneCode: "+691" },
            { code: "md", name: "Moldova", phoneCode: "+373" },
            { code: "mc", name: "Monaco", phoneCode: "+377" },
            { code: "mn", name: "Mongolia", phoneCode: "+976" },
            { code: "me", name: "Montenegro", phoneCode: "+382" },
            { code: "ms", name: "Montserrat", phoneCode: "+1664" },
            { code: "ma", name: "Morocco", phoneCode: "+212" },
            { code: "mz", name: "Mozambique", phoneCode: "+258" },
            { code: "mm", name: "Myanmar", phoneCode: "+95" },
            { code: "na", name: "Namibia", phoneCode: "+264" },
            { code: "nr", name: "Nauru", phoneCode: "+674" },
            { code: "np", name: "Nepal", phoneCode: "+977" },
            { code: "nl", name: "Netherlands", phoneCode: "+31" },
            { code: "nc", name: "New Caledonia", phoneCode: "+687" },
            { code: "nz", name: "New Zealand", phoneCode: "+64" },
            { code: "ni", name: "Nicaragua", phoneCode: "+505" },
            { code: "ne", name: "Niger", phoneCode: "+227" },
            { code: "ng", name: "Nigeria", phoneCode: "+234" },
            { code: "nu", name: "Niue", phoneCode: "+683" },
            { code: "nf", name: "Norfolk Island", phoneCode: "+672" },
            { code: "mp", name: "Northern Mariana Islands", phoneCode: "+1670" },
            { code: "no", name: "Norway", phoneCode: "+47" },
            { code: "om", name: "Oman", phoneCode: "+968" },
            { code: "pk", name: "Pakistan", phoneCode: "+92" },
            { code: "pw", name: "Palau", phoneCode: "+680" },
            { code: "ps", name: "Palestine", phoneCode: "+970" },
            { code: "pa", name: "Panama", phoneCode: "+507" },
            { code: "pg", name: "Papua New Guinea", phoneCode: "+675" },
            { code: "py", name: "Paraguay", phoneCode: "+595" },
            { code: "pe", name: "Peru", phoneCode: "+51" },
            { code: "ph", name: "Philippines", phoneCode: "+63" },
            { code: "pl", name: "Poland", phoneCode: "+48" },
            { code: "pt", name: "Portugal", phoneCode: "+351" },
            { code: "pr", name: "Puerto Rico", phoneCode: "+1939" },
            { code: "qa", name: "Qatar", phoneCode: "+974" },
            { code: "ro", name: "Romania", phoneCode: "+40" },
            { code: "ru", name: "Russia", phoneCode: "+7" },
            { code: "rw", name: "Rwanda", phoneCode: "+250" },
            { code: "kn", name: "Saint Kitts and Nevis", phoneCode: "+1869" },
            { code: "lc", name: "Saint Lucia", phoneCode: "+1758" },
            { code: "vc", name: "Saint Vincent and the Grenadines", phoneCode: "+1784" },
            { code: "ws", name: "Samoa", phoneCode: "+685" },
            { code: "sm", name: "San Marino", phoneCode: "+378" },
            { code: "st", name: "Sao Tome and Principe", phoneCode: "+239" },
            { code: "sa", name: "Saudi Arabia", phoneCode: "+966" },
            { code: "sn", name: "Senegal", phoneCode: "+221" },
            { code: "rs", name: "Serbia", phoneCode: "+381" },
            { code: "sc", name: "Seychelles", phoneCode: "+248" },
            { code: "sl", name: "Sierra Leone", phoneCode: "+232" },
            { code: "sg", name: "Singapore", phoneCode: "+65" },
            { code: "sk", name: "Slovakia", phoneCode: "+421" },
            { code: "si", name: "Slovenia", phoneCode: "+386" },
            { code: "sb", name: "Solomon Islands", phoneCode: "+677" },
            { code: "so", name: "Somalia", phoneCode: "+252" },
            { code: "za", name: "South Africa", phoneCode: "+27" },
            { code: "ss", name: "South Sudan", phoneCode: "+211" },
            { code: "es", name: "Spain", phoneCode: "+34" },
            { code: "lk", name: "Sri Lanka", phoneCode: "+94" },
            { code: "sd", name: "Sudan", phoneCode: "+249" },
            { code: "sr", name: "Suriname", phoneCode: "+597" },
            { code: "sz", name: "Swaziland", phoneCode: "+268" },
            { code: "se", name: "Sweden", phoneCode: "+46" },
            { code: "ch", name: "Switzerland", phoneCode: "+41" },
            { code: "sy", name: "Syria", phoneCode: "+963" },
            { code: "tw", name: "Taiwan", phoneCode: "+886" },
            { code: "tj", name: "Tajikistan", phoneCode: "+992" },
            { code: "tz", name: "Tanzania", phoneCode: "+255" },
            { code: "th", name: "Thailand", phoneCode: "+66" },
            { code: "tl", name: "Timor-Leste", phoneCode: "+670" },
            { code: "tg", name: "Togo", phoneCode: "+228" },
            { code: "tk", name: "Tokelau", phoneCode: "+690" },
            { code: "to", name: "Tonga", phoneCode: "+676" },
            { code: "tt", name: "Trinidad and Tobago", phoneCode: "+1868" },
            { code: "tn", name: "Tunisia", phoneCode: "+216" },
            { code: "tr", name: "Turkey", phoneCode: "+90" },
            { code: "tm", name: "Turkmenistan", phoneCode: "+993" },
            { code: "tc", name: "Turks and Caicos Islands", phoneCode: "+1649" },
            { code: "tv", name: "Tuvalu", phoneCode: "+688" },
            { code: "ug", name: "Uganda", phoneCode: "+256" },
            { code: "ua", name: "Ukraine", phoneCode: "+380" },
            { code: "ae", name: "United Arab Emirates", phoneCode: "+971" },
            { code: "gb", name: "United Kingdom", phoneCode: "+44" },
            { code: "us", name: "United States", phoneCode: "+1" },
            { code: "uy", name: "Uruguay", phoneCode: "+598" },
            { code: "uz", name: "Uzbekistan", phoneCode: "+998" },
            { code: "vu", name: "Vanuatu", phoneCode: "+678" },
            { code: "ve", name: "Venezuela", phoneCode: "+58" },
            { code: "vn", name: "Vietnam", phoneCode: "+84" },
            { code: "vg", name: "Virgin Islands, British", phoneCode: "+1284" },
            { code: "vi", name: "Virgin Islands, U.S.", phoneCode: "+1340" },
            { code: "ye", name: "Yemen", phoneCode: "+967" },
            { code: "zm", name: "Zambia", phoneCode: "+260" },
            { code: "zw", name: "Zimbabwe", phoneCode: "+263" }
        ];

        return this.each(function(){
            var $this = $(this);

            // Create wrapper div
            var wrapper = $('<div class="cc-picker-wrapper"></div>');
            $this.wrap(wrapper);

            // Create dropdown HTML
            var dropdownHTML = '<div class="cc-picker-dropdown">';
            dropdownHTML += '<div class="cc-picker-search"><input type="text" class="cc-search-input" placeholder="Search country..."></div>';
            dropdownHTML += '<ul class="cc-picker-list">';

            countriesData.forEach(function(country){
                dropdownHTML += '<li class="cc-picker-item" data-code="' + country.phoneCode + '" data-country="' + country.code + '">';
                dropdownHTML += '<span class="cc-flag cc-flag-' + country.code + '"></span>';
                dropdownHTML += '<span class="cc-name">' + country.name + '</span>';
                dropdownHTML += '<span class="cc-code">' + country.phoneCode + '</span>';
                dropdownHTML += '</li>';
            });

            dropdownHTML += '</ul></div>';

            // Add dropdown after input
            $(dropdownHTML).insertAfter($this);

            // Set initial value
            var initialCountry = countriesData.find(c => c.code === settings.countryCode) || countriesData[0];
            $this.val(initialCountry.phoneCode);

            // Add hidden input for dial code if needed
            if(settings.dialCodeFieldName){
                var hiddenInput = $('<input type="hidden" name="' + settings.dialCodeFieldName + '" value="' + initialCountry.phoneCode + '">');
                hiddenInput.insertAfter($this);
            }

            // Toggle dropdown
            $this.on('click', function(e){
                e.stopPropagation();
                $('.cc-picker-dropdown').not($(this).next('.cc-picker-dropdown')).hide();
                $(this).next('.cc-picker-dropdown').toggle();
            });

            // Select country
            $(document).on('click', '.cc-picker-item', function(){
                var code = $(this).data('code');
                var $input = $(this).closest('.cc-picker-wrapper').find('input[type="text"], input[type="tel"]').first();
                $input.val(code);

                // Update hidden input if exists
                var $hiddenInput = $(this).closest('.cc-picker-wrapper').find('input[type="hidden"]');
                if($hiddenInput.length){
                    $hiddenInput.val(code);
                }

                // Trigger change event
                $input.trigger('change');

                // Hide dropdown
                $(this).closest('.cc-picker-dropdown').hide();
            });

            // Search functionality
            $(document).on('keyup', '.cc-search-input', function(){
                var searchTerm = $(this).val().toLowerCase();
                var $list = $(this).closest('.cc-picker-dropdown').find('.cc-picker-item');

                $list.each(function(){
                    var countryName = $(this).find('.cc-name').text().toLowerCase();
                    var countryCode = $(this).find('.cc-code').text();

                    if(countryName.indexOf(searchTerm) > -1 || countryCode.indexOf(searchTerm) > -1){
                        $(this).show();
                    } else {
                        $(this).hide();
                    }
                });
            });

            // Close dropdown when clicking outside
            $(document).on('click', function(){
                $('.cc-picker-dropdown').hide();
            });

            $('.cc-picker-dropdown').on('click', function(e){
                e.stopPropagation();
            });
        });
    };
}(jQuery));