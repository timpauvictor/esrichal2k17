# e-Range: ECCE App Challenge 2017 Entry

Video: https://vimeo.com/209967208

To view the website locally (it still requires some javascript CDNs and Material design lite so entirely offline viewing isn't possible), you would have to:
  1. Clone the repo using git: `git clone https://github.com/timpauvictor/esrichal2k17.git <directory>`
  2. change directory into it: `cd /some/directory/...`
  3. start a server in this directory; my preferred method was using python3 since it has a handy simple HTTPWebServer: `python -m http.server 8000`
  4. now you can go ahead and load up `localhost:8000/rehamilton.html` in your browser and enjoy!

## About this app

  Using a mixture of open data this application serves to promote the validity of sustainable transportation in Canada. The app displays point information for charging stations across the country. Directions to these stations can be created by clicking on the hyperlink that appears when you pin your location or choose a location on the map. <br>
Furthermore, data for available electric cars in Canada can be accessed by clicking on the car icon in the top right corner. This table displays information relating to make, model, year, and charging time (hours), and is sorted according to electric range (kilometers). 
Other general functionalities are included on the left side of the screen, where you can zoom in and out, return to full extent and pin your location.

## Why?

This app was created with <b>love</b> (and javascript) by McMaster University students who understand the growing validity of sustainable transportation. Our inspiration for this app was the difficulty in finding a one-stop location for all information regarding both charging stations and available electric cars. <br>
With E-Range we hope to educate Canadians about the validity of electric vehicles across the country. By switching to sustainable transportation, you can do your part in reducing greenhouse gas emissions to improve the environment. <br>


## Open Data Used:

  Charging locations taken from the OpenChargeMap API: https://openchargemap.org/site
  Video music sourced from: http://www.bensound.com/
  Car info sourced from Open Government Portal: http://open.canada.ca/data/en/dataset/98f1a129-f628-4ce4-b24d-6f16bf24dd64
