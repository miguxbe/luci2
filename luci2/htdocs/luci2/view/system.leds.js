L.ui.view.extend({
    execute: function() {
        var m = new L.cbi.Map('system', {
            caption:     L.tr('LED Configuration'),
            description: L.tr('Customizes the behaviour of the device LEDs if possible.'),
            prepare: function() {
                return $.when(
                    L.system.listLEDs(function(leds) {
                        delete m.sections[0].fields.sysfs.choices;
                        delete m.sections[0].fields.trigger.choices;

                        for (var i = 0; i < leds.length; i++)
                            m.sections[0].fields.sysfs.value(leds[i].name);

                        for (var i = 0; i < leds[0].triggers.length; i++)
                            m.sections[0].fields.trigger.value(leds[0].triggers[i]);
                    }),
                    L.system.listUSBDevices(function(devs) {
                        delete m.sections[0].fields._usb_dev.choices;

                        for (var i = 0; i < devs.length; i++)
                            m.sections[0].fields._usb_dev.value(devs[i].name,
                                                                '%04x:%04x (%s - %s)'.format(devs[i].vendor_id, devs[i].product_id,
                                                                                             devs[i].vendor_name || '?', devs[i].product_name || '?'));
                    }),
                    L.network.getDeviceStatus(undefined, function(devs) {
                        var devices = [ ];

                        for (var device in devs)
                            if (device != 'lo')
                                devices.push(device);

                        devices.sort();

                        delete m.sections[0].fields._net_dev.choices;

                        for (var i = 0; i < devices.length; i++)
                            m.sections[0].fields._net_dev.value(devices[i]);
                    })
                );
            }
        });

        var s = m.section(L.cbi.TypedSection, 'led', {
            caption:     function(sid) { return sid ? (this.fields.name.textvalue(sid) || L.tr('Unnamed LED')) : '' },
            teasers:     [ 'sysfs', 'default', 'trigger', '_net_dev', 'mode', '_usb_dev', 'delayon', 'delayoff' ],
            collabsible: true,
            addremove:   true,
            add_caption: L.tr('Add new LED defintion'),
            remove_caption: L.tr('Remove LED definition'),
            readonly:    !this.options.acls.leds
        });

        s.option(L.cbi.InputValue, 'name', {
            caption:     L.tr('Name')
        });

        s.option(L.cbi.ListValue, 'sysfs', {
            caption:     L.tr('LED Name')
        });

        s.option(L.cbi.ListValue, 'default', {
            caption:     L.tr('Default state'),
            initial:     '0'
        }).value('0', L.trc('LED state', 'off')).value('1', L.trc('LED state', 'on'));

        s.option(L.cbi.ListValue, 'trigger', {
            caption:     L.tr('Trigger')
        });


        s.option(L.cbi.InputValue, 'delayon', {
            caption:     L.trc('LED timer trigger', 'On-State Delay'),
            description: L.trc('LED timer trigger', 'Time in milliseconds the LED stays on'),
            datatype:    'uinteger'
        }).depends('trigger', 'timer');

        s.option(L.cbi.InputValue, 'delayoff', {
            caption:     L.trc('LED timer trigger', 'Off-State Delay'),
            description: L.trc('LED timer trigger', 'Time in milliseconds the LED stays off'),
            datatype:    'uinteger'
        }).depends('trigger', 'timer');


        s.option(L.cbi.ListValue, '_net_dev', {
            caption:     L.trc('LED netdev trigger', 'Device'),
            uci_option:  'dev',
            optional:    true
        }).depends('trigger', 'netdev');

        s.option(L.cbi.MultiValue, 'mode', {
            caption:     L.trc('LED netdev trigger', 'Trigger Mode')
        }).depends('trigger', 'netdev')
            .value('link', L.trc('LED netdev trigger mode', 'Link On'))
            .value('tx',   L.trc('LED netdev trigger mode', 'Transmit'))
            .value('rx',   L.trc('LED netdev trigger mode', 'Receive'));


        s.option(L.cbi.ListValue, '_usb_dev', {
            caption:     L.trc('LED usbdev trigger', 'Device'),
            uci_option:  'dev',
            optional:    true
        }).depends('trigger', 'usbdev');

        return m.insertInto('#map');
    }
});
