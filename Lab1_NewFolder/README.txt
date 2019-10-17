Conceptual model for Lab 1
Create map of spatiotemporal data visualization
15 points with at least 7 timestamps and the following interactions:
(done) Pan  - native to Mapbox styles
(done) Zoom - native to Mapbox styles
Retrieve - click on point to open information in side panel or pop-up
	(done) iterate through the data layers
	get timestamps, StationID or WATER_NAME, phosphorus concentration for that timestamp
	use timestamps for later sequence operation
	show results in side panel or pop-up
Sequence - slider bar iteratively going through timestamps
	put timestamps into array for sequencing
	add slider bar to indicate progression through time
	add forward and reverse arrows so the user can operate the slider bar	
Operator of my choosing 
	Ideas: Filter average annual P values to see if there's areas with trends of concern, like consistently high average P.
	Elevated P is considered > 0.1 mg/L
	filter samples that are considered high (> 0.25 mg/L); medium (0.045 mg/L - 0.25 mg/L); or low (<0.045 mg/L)
	Need to create marker size or color (color may be easier to distinguish) for high, medium, low
	filter for those values that are in the specified range
	assign marker symbology based on high, medium, low P value OR simply elevated P concentratinos.

Must include temporal and map legend. 
(done - sortof) Contextualize the map within a web page.  Provide title, cite sources and use supplemental text to provide context.
