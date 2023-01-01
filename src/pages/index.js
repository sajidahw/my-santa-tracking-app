import Head from 'next/head';
import useSWR from 'swr';// hook install; to fetch data using SWR
import Layout from '@components/Layout';
import Section from '@components/Section';
import Container from '@components/Container';
import Map from '@components/Map';
import Button from '@components/Button';

import styles from '@styles/Home.module.scss';

const DEFAULT_CENTER = [38.907132, -77.036546]
const fetcher = (url) => fetch(url).then((res) => res.json());//defining fetch function/how to fetch data

export default function Home() {
  const { data } = useSWR(
    'https://firebasestorage.googleapis.com/v0/b/santa-tracker-firebase.appspot.com/o/route%2Fsanta_en.json?alt=media&2018b',
    fetcher
  );//setting up request for fetching using api endpoint
  console.log(data);
// update for current date/time with updated dates for destination popup

// const currentDate = new Date(Date.now());//for real time, will show all delivered

//faked time below to show not Xmas time yet completely
const currentDate = new Date('2022-12-25T02:34:30.115Z');//9:34 pm EST setting

const currentYear = currentDate.getFullYear();
const destinations = data?.destinations.map((destination) => {
  const { arrival, departure } = destination;

  const arrivalDate = new Date(arrival);
  const departureDate = new Date(departure);

  arrivalDate.setFullYear(currentYear);
  departureDate.setFullYear(currentYear);

  return {
    ...destination,
    arrival: arrivalDate.getTime(),
    departure:  departureDate.getTime(),
  }
});

  return (
    <Layout>
      <Head>
        <title>Next.js Leaflet Starter</title>
        <meta name="description" content="Create mapping apps with Next.js Leaflet Starter" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Section>
        <Container>
          <h1 className={styles.title}>
            Next.js Leaflet Starter
          </h1>
          {/* Center and Zoom updated so map is levelled and centered. Pop ups added to include city, region */}
          <Map className={styles.homeMap} width="800" height="400" center={[0, 0]} zoom={1}>
            {({ TileLayer, Marker, Popup }, Leaflet) => (
              <>
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution="&copy; <a href=&quot;http://osm.org/copyright&quot;>OpenStreetMap</a> contributors"
                /> 
                {/* TileLayer: //map imagery/background of map */}
                {/* Updated map markers with arrival and departure times & values, formatted time, and added
                arrival and departure datetimes to Popup */}
                {destinations?.map(({ id, arrival, departure, location, city, region }) => {
                  const arrivalDate = new Date(arrival);
                  const arrivalHours = arrivalDate.getHours()
                  const arrivalMinutes = arrivalDate.getMinutes()
                  const arrivalTime = `${arrivalHours}:${arrivalMinutes}`;

                  const departureDate = new Date(departure);
                  const departureHours = departureDate.getHours()
                  const departureMinutes = departureDate.getMinutes()
                  const departureTime = `${departureHours}:${departureMinutes}`;
                  
                  const santaWasHere = currentDate.getTime() - departureDate.getTime() > 0;
                  const santaIsHere = currentDate.getTime() - arrivalDate.getTime() > 0 && !santaWasHere;

                  let iconUrl = '/leaflet/images/tree-marker-icon.png';
                  let iconRetinaUrl = '/leaflet/images/tree-marker-icon-2x.png';
                  
                  if ( santaIsHere ) {
                    iconUrl = '/leaflet/images/santa-marker-icon.png';
                    iconRetinaUrl = '/leaflet/images/santa-marker-icon-2x.png';
                  }
                  
                  if ( santaWasHere ) {
                    iconUrl = '/leaflet/images/gift-marker-icon.png';
                    iconRetinaUrl = '/leaflet/images/gift-marker-icon-2x.png';
                  }

                  // fix so that Santa icon appears in front of other icons
                  let className = '';
                  if ( santaIsHere ) {
                    className = `${className} ${styles.iconSantaIsHere}`;
                  }

                  return (
                    // Updated Marker to also use customized icons
                    <Marker 
                      key={id} 
                      position={[location.lat, location.lng]}
                      icon={Leaflet.icon({
                        iconUrl,
                        iconRetinaUrl,
                        iconSize: [41, 41],
                        className
                      })}
                    >
                      <Popup>
                        <strong>Location:</strong> { city }, { region }
                        <br />
                        <strong>Arrival:</strong> { arrivalDate.toDateString() } @ { arrivalTime }
                        <br />
                        <strong>Departure:</strong> { arrivalDate.toDateString() } @ { departureTime }
                      </Popup>
                    </Marker>/* Marker: //map pin */
                  )
                })}
              </>
            )}
          </Map>

          <p className={styles.description}>
            <code className={styles.code}>yarn create next-app -e https://github.com/colbyfayock/next-leaflet-starter</code>
          </p>

          <p className={styles.view}>
            <Button href="https://github.com/colbyfayock/next-leaflet-starter">Vew on GitHub</Button>
          </p>
        </Container>
      </Section>
    </Layout>
  )
}
