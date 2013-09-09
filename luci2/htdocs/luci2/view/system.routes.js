L.ui.view.extend({
	title: L.tr('Routes'),
	description: L.tr('The following rules are currently active on this system.'),
	execute: function() {
		return $.when(
			L.network.getARPTable(function(arp) {
				var arpTable = new L.ui.table({
					caption: L.tr('ARP'),
					columns: [{
						caption: L.tr('IPv4-Address'),
						key:     'ipaddr'
					}, {
						caption: L.tr('MAC-Address'),
						key:     'macaddr'
					}, {
						caption: L.tr('Interface'),
						key:     'device'
					}]
				});

				arpTable.rows(arp);
				arpTable.insertInto('#arp_table');
			}),
			L.network.getRoutes(function(routes) {
				var routeTable = new L.ui.table({
					caption: L.tr('Active IPv4-Routes'),
					columns: [{
						caption: L.tr('Target'),
						key:     'target'
					}, {
						caption: L.tr('Gateway'),
						key:     'nexthop'
					}, {
						caption: L.tr('Metric'),
						key:     'metric'
					}, {
						caption: L.tr('Interface'),
						key:     'device'
					}]
				});

				routeTable.rows(routes);
				routeTable.insertInto('#route_table');
			}),
			L.network.getIPv6Routes(function(routes) {
				var route6Table = new L.ui.table({
					caption: L.tr('Active IPv6-Routes'),
					columns: [{
						caption: L.tr('Target'),
						key:     'target'
					}, {
						caption: L.tr('Gateway'),
						key:     'nexthop'
					}, {
						caption: L.tr('Source'),
						key:     'source'
					}, {
						caption: L.tr('Metric'),
						key:     'metric'
					}, {
						caption: L.tr('Interface'),
						key:     'device'
					}]
				});

				for (var i = 0; i < routes.length; i++)
				{
					var prefix = routes[i].target.substr(0, 5).toLowerCase();
					if (prefix == 'fe80:' || prefix == 'fe90:' || prefix == 'fea0:' || prefix == 'feb0:' || prefix == 'ff00:')
						continue;

					route6Table.row(routes[i]);
				}

				route6Table.insertInto('#route6_table');
			})
		)
	}
});
