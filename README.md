                     ______                       __  _ ____     
                    / ____/__  ____  ____  ____  / /_(_) __/_  __
                   / / __/ _ \/ __ \/ __ \/ __ \/ __/ / /_/ / / /
                  / /_/ /  __/ /_/ / / / / /_/ / /_/ / __/ /_/ / 
                  \____/\___/\____/_/ /_/\____/\__/_/_/  \__, /  
                                                        /____/  
    
                      MADE IN 24 HOURS FOR THE SEATTLE OPEN 
                      GOVERNMENT HACKATHON - AUGUST 23 2010
                      
                           BY REID BEELS AND MAX OGDEN
                               @REIDAB       @MAXOGDEN

                              WITH ASSISTANCE FROM:
                         ANDREW KURTZ AND RUSSELL BRANCA!
                            @GZUKI          @CHEWBRANCA
    
                                 ,|
                               //|                              ,|
                             //,/                             -~ |
                           // / |                         _-~   /  ,
                         /'/ / /                       _-~   _/_-~ |
                        ( ( / /'                   _ -~     _-~ ,/'
                         \~\/'/|             __--~~__--\ _-~  _/,
                 ,,)))))));, \/~-_     __--~~  --~~  __/~  _-~ /
              __))))))))))))));,>/\   /        __--~~  \-~~ _-~
             -\(((((''''(((((((( >~\/     --~~   __--~' _-~ ~|
    --==//////((''  .     `)))))), /     ___---~~  ~~\~~__--~
            ))| @    ;-.     (((((/           __--~~~'~~/
            ( `|    /  )      )))/      ~~~~~__\__---~~__--~~--_
               |   |   |       (/      ---~~~/__-----~~  ,;::'  \         ,
               o_);   ;        /      ----~~/           \,-~~~\  |       /|
                     ;        (      ---~~/         `:::|      |;|      < >
                    |   _      `----~~~~'      /      `:|       \;\_____//
              ______/\/~    |                 /        /         ~------~
            /~;;.____/;;'  /          ___----(   `;;;/
           / //  _;______;'------~~~~~    |;;/\    /
          //  | |                        /  |  \;;,\
         (<_  | ;                      /',/-----'  _>
          \_| ||_                     //~;~~~~~~~~~
              `\_|                   (,~~
                                      \~\

![Screenshot](http://farm5.static.flickr.com/4073/4918972276_c83010f1f0_z.jpg "Screenshot")

# What's this all about?

You can go to a website, draw your commute on a map, and choose to be notified when events occur on your commute. For instance, if you there is a road construction project starting on July 20th, you will receive a notification (phone call or text message via the Tropo API) on the 19th reminding you that your commute will be obstructed in the morning.

The web facing portion is a Rails app that runs on Heroku. Users can register, enter phone numbers, and draw areas of interest on a Google map. Then they can choose which notifications they would like to receive for which areas of interest.

# Where do the scheduled events come from?

There are a variety of government released datasets available at websites like data.seattle.gov, datasf.org and pdxapi.com. We are hoping to adapt datasets that have both time and geographic information. Some examples are road construction closures, move-your-car-or-get-a-ticket street sweepings, city hall meetings, etc. We also would like to accept community contributed schedules. Being able to get notified when there are new farmers markets, free couches, or rideshares in your neighborhood would be pretty awesome.

# Developer Stuff

Notification generation involves utilizing GeoCouch's R-tree spatial index as well as a Couch list view that calculates polygon intersections (to calculate when users's areas and times of interest intersect with their subscriptions' areas and times).

## Data Formats

If you would like to contribute a new dataset to be made available as a schedule inside of the application, please format the data as follows:

Schedule Entry:

    {
        info: "paving the Couch-Burnside couplet"
        starts_at: 2009-12-18T00:00:00Z,
        ends_at: 2009-12-19T00:00:00Z,
        area:  { "type": "Polygon",
                  "coordinates": [
                   [-122.34100341796875,47.739446498637776],
                   [-122.5030517578125,47.60258275608435],
                   [-122.39593505859375,47.492276537740416]
                 ]
              }
    }


Schedule Dataset Metadata:

    {
        name: "Road Construction Projects",
        description: "road closures, delays",
        area:  { "type": "Polygon",
                  "coordinates": [
                   [-122.48931884765625,47.86950316614039],
                   [-122.80517578125,47.655336290758285],
                   [-122.63763427734375,47.60258275608435]
                 ]
              }
    }

User Area of Interest:

    {
        name: "my commute",
        starts_at: 2009-12-18T00:00:00Z,
        ends_at: 2009-12-19T00:00:00Z,
        description: "where I drive to work",
        area:  { "type": "Polygon",
                  "coordinates": [
                 [-122.23388671875,47.80036462595262],
                 [-122.3162841796875,47.688626879942966],
                 [-122.14187622070312,47.576649235558236],
                 [-122.04437255859375,47.75422108200102]
               ]
            }
    }