/**
 * Country Code Picker jQuery Plugin
 * A simple country code selector with flags
 */
(function($) {
    'use strict';

    // Country data with flags and codes
    const countries = [
        { name: 'India', code: '+91', flag: '🇮🇳' },
        { name: 'United States', code: '+1', flag: '🇺🇸' },
        { name: 'United Kingdom', code: '+44', flag: '🇬🇧' },
        { name: 'Canada', code: '+1', flag: '🇨🇦' },
        { name: 'Australia', code: '+61', flag: '🇦🇺' },
        { name: 'Germany', code: '+49', flag: '🇩🇪' },
        { name: 'France', code: '+33', flag: '🇫🇷' },
        { name: 'Italy', code: '+39', flag: '🇮🇹' },
        { name: 'Spain', code: '+34', flag: '🇪🇸' },
        { name: 'Netherlands', code: '+31', flag: '🇳🇱' },
        { name: 'Belgium', code: '+32', flag: '🇧🇪' },
        { name: 'Switzerland', code: '+41', flag: '🇨🇭' },
        { name: 'Austria', code: '+43', flag: '🇦🇹' },
        { name: 'Sweden', code: '+46', flag: '🇸🇪' },
        { name: 'Norway', code: '+47', flag: '🇳🇴' },
        { name: 'Denmark', code: '+45', flag: '🇩🇰' },
        { name: 'Finland', code: '+358', flag: '🇫🇮' },
        { name: 'Poland', code: '+48', flag: '🇵🇱' },
        { name: 'Russia', code: '+7', flag: '🇷🇺' },
        { name: 'China', code: '+86', flag: '🇨🇳' },
        { name: 'Japan', code: '+81', flag: '🇯🇵' },
        { name: 'South Korea', code: '+82', flag: '🇰🇷' },
        { name: 'Singapore', code: '+65', flag: '🇸🇬' },
        { name: 'Malaysia', code: '+60', flag: '🇲🇾' },
        { name: 'Indonesia', code: '+62', flag: '🇮🇩' },
        { name: 'Thailand', code: '+66', flag: '🇹🇭' },
        { name: 'Philippines', code: '+63', flag: '🇵🇭' },
        { name: 'Vietnam', code: '+84', flag: '🇻🇳' },
        { name: 'United Arab Emirates', code: '+971', flag: '🇦🇪' },
        { name: 'Saudi Arabia', code: '+966', flag: '🇸🇦' },
        { name: 'Qatar', code: '+974', flag: '🇶🇦' },
        { name: 'Kuwait', code: '+965', flag: '🇰🇼' },
        { name: 'Bahrain', code: '+973', flag: '🇧🇭' },
        { name: 'Oman', code: '+968', flag: '🇴🇲' },
        { name: 'Israel', code: '+972', flag: '🇮🇱' },
        { name: 'Turkey', code: '+90', flag: '🇹🇷' },
        { name: 'South Africa', code: '+27', flag: '🇿🇦' },
        { name: 'Egypt', code: '+20', flag: '🇪🇬' },
        { name: 'Nigeria', code: '+234', flag: '🇳🇬' },
        { name: 'Kenya', code: '+254', flag: '🇰🇪' },
        { name: 'Brazil', code: '+55', flag: '🇧🇷' },
        { name: 'Argentina', code: '+54', flag: '🇦🇷' },
        { name: 'Mexico', code: '+52', flag: '🇲🇽' },
        { name: 'Chile', code: '+56', flag: '🇨🇱' },
        { name: 'Colombia', code: '+57', flag: '🇨🇴' },
        { name: 'Peru', code: '+51', flag: '🇵🇪' },
        { name: 'New Zealand', code: '+64', flag: '🇳🇿' },
        { name: 'Ireland', code: '+353', flag: '🇮🇪' },
        { name: 'Portugal', code: '+351', flag: '🇵🇹' },
        { name: 'Greece', code: '+30', flag: '🇬🇷' },
        { name: 'Czech Republic', code: '+420', flag: '🇨🇿' },
        { name: 'Hungary', code: '+36', flag: '🇭🇺' },
        { name: 'Romania', code: '+40', flag: '🇷🇴' },
        { name: 'Ukraine', code: '+380', flag: '🇺🇦' },
        { name: 'Bangladesh', code: '+880', flag: '🇧🇩' },
        { name: 'Pakistan', code: '+92', flag: '🇵🇰' },
        { name: 'Sri Lanka', code: '+94', flag: '🇱🇰' },
        { name: 'Nepal', code: '+977', flag: '🇳🇵' },
        { name: 'Afghanistan', code: '+93', flag: '🇦🇫' },
        { name: 'Myanmar', code: '+95', flag: '🇲🇲' },
        { name: 'Cambodia', code: '+855', flag: '🇰🇭' },
        { name: 'Laos', code: '+856', flag: '🇱🇦' },
        { name: 'Hong Kong', code: '+852', flag: '🇭🇰' },
        { name: 'Taiwan', code: '+886', flag: '🇹🇼' },
        { name: 'Macao', code: '+853', flag: '🇲🇴' },
        { name: 'Iceland', code: '+354', flag: '🇮🇸' },
        { name: 'Luxembourg', code: '+352', flag: '🇱🇺' },
        { name: 'Malta', code: '+356', flag: '🇲🇹' },
        { name: 'Cyprus', code: '+357', flag: '🇨🇾' },
        { name: 'Croatia', code: '+385', flag: '🇭🇷' },
        { name: 'Slovenia', code: '+386', flag: '🇸🇮' },
        { name: 'Slovakia', code: '+421', flag: '🇸🇰' },
        { name: 'Bulgaria', code: '+359', flag: '🇧🇬' },
        { name: 'Serbia', code: '+381', flag: '🇷🇸' },
        { name: 'Bosnia', code: '+387', flag: '🇧🇦' },
        { name: 'Montenegro', code: '+382', flag: '🇲🇪' },
        { name: 'Albania', code: '+355', flag: '🇦🇱' },
        { name: 'North Macedonia', code: '+389', flag: '🇲🇰' }
    ];

    $.fn.ccpicker = function(options) {
        const settings = $.extend({
            countryCode: '+91',
            dataTarget: null,
            onChange: null
        }, options);

        return this.each(function() {
            const $input = $(this);
            const targetSelector = settings.dataTarget || $input.data('ccpicker');
            const $hiddenInput = $(targetSelector);

            // Create wrapper structure
            const wrapperId = 'ccpicker-' + Math.random().toString(36).substr(2, 9);
            $input.wrap('<div class="ccpicker-container" id="' + wrapperId + '"></div>');
            const $container = $input.parent();

            // Set initial country code
            let selectedCountry = countries.find(c => c.code === settings.countryCode) || countries[0];
            if ($hiddenInput.length && $hiddenInput.val()) {
                const existingCountry = countries.find(c => c.code === $hiddenInput.val());
                if (existingCountry) {
                    selectedCountry = existingCountry;
                }
            }

            // Create code display
            const $codeDisplay = $('<div class="ccpicker-code-display">' +
                '<span class="ccpicker-flag">' + selectedCountry.flag + '</span>' +
                '<span class="ccpicker-code">' + selectedCountry.code + '</span>' +
                '</div>');

            // Create dropdown
            const $dropdown = $('<div class="ccpicker-dropdown">' +
                '<input type="text" class="ccpicker-search" placeholder="Search country...">' +
                '<ul class="ccpicker-list"></ul>' +
                '</div>');

            // Populate country list
            const $list = $dropdown.find('.ccpicker-list');
            countries.forEach(country => {
                const $item = $('<li class="ccpicker-item" data-code="' + country.code + '">' +
                    '<span class="ccpicker-item-flag">' + country.flag + '</span>' +
                    '<span class="ccpicker-item-name">' + country.name + '</span>' +
                    '<span class="ccpicker-item-code">' + country.code + '</span>' +
                    '</li>');

                if (country.code === selectedCountry.code) {
                    $item.addClass('selected');
                }

                $list.append($item);
            });

            // Insert elements
            $input.before($codeDisplay);
            $container.append($dropdown);

            // Set hidden input value
            if ($hiddenInput.length) {
                $hiddenInput.val(selectedCountry.code);
            }

            // Toggle dropdown
            $codeDisplay.on('click', function(e) {
                e.stopPropagation();
                $dropdown.toggleClass('active');
                if ($dropdown.hasClass('active')) {
                    $dropdown.find('.ccpicker-search').focus();
                }
            });

            // Select country
            $list.on('click', '.ccpicker-item', function() {
                const code = $(this).data('code');
                const country = countries.find(c => c.code === code);

                if (country) {
                    selectedCountry = country;

                    // Update display
                    $codeDisplay.find('.ccpicker-flag').text(country.flag);
                    $codeDisplay.find('.ccpicker-code').text(country.code);

                    // Update hidden input
                    if ($hiddenInput.length) {
                        $hiddenInput.val(country.code);
                    }

                    // Update selected state
                    $list.find('.ccpicker-item').removeClass('selected');
                    $(this).addClass('selected');

                    // Close dropdown
                    $dropdown.removeClass('active');

                    // Trigger change callback
                    if (settings.onChange && typeof settings.onChange === 'function') {
                        settings.onChange(country.code, country);
                    }
                }
            });

            // Search functionality
            const $search = $dropdown.find('.ccpicker-search');
            $search.on('input', function() {
                const query = $(this).val().toLowerCase();

                $list.find('.ccpicker-item').each(function() {
                    const $item = $(this);
                    const name = $item.find('.ccpicker-item-name').text().toLowerCase();
                    const code = $item.find('.ccpicker-item-code').text().toLowerCase();

                    if (name.includes(query) || code.includes(query)) {
                        $item.show();
                    } else {
                        $item.hide();
                    }
                });
            });

            // Close dropdown on outside click
            $(document).on('click', function(e) {
                if (!$(e.target).closest('#' + wrapperId).length) {
                    $dropdown.removeClass('active');
                }
            });

            // Prevent dropdown close when clicking inside
            $dropdown.on('click', function(e) {
                e.stopPropagation();
            });
        });
    };

})(jQuery);
