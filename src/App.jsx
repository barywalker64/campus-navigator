
import { useMemo, useState, useEffect } from 'react'
import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Popup,
  Polyline,
  useMap
} from 'react-leaflet'

import {
  Search,
  MapPin,
  Navigation,
  BookOpen,
  Coffee,
  Dumbbell,
  Building2,
  Home,
  GraduationCap,
  X,
  LocateFixed,
  Route,
  Menu,
  ArrowRight,
  Clock,
  Compass,
  Footprints,
  AlertCircle
} from 'lucide-react'

import './App.css'

// DEMO CAMPUS COORDINATES
// Replace these with your actual college coordinates later.

const locations = [
  {
    id: 1,
    name: 'Main Academic Block',
    category: 'Academic',
    description: 'Main building containing classrooms and academic departments.',
    lat: 30.3165,
    lng: 78.0322,
    hours: '9:00 AM - 5:00 PM',
    icon: Building2
  },
  {
    id: 2,
    name: 'Central Library',
    category: 'Library',
    description: 'A quiet space for reading, research and studying.',
    lat: 30.3172,
    lng: 78.0330,
    hours: '8:00 AM - 8:00 PM',
    icon: BookOpen
  },
  {
    id: 3,
    name: 'Campus Cafeteria',
    category: 'Food',
    description: 'Food court offering snacks, meals and beverages.',
    lat: 30.3159,
    lng: 78.0335,
    hours: '9:00 AM - 7:00 PM',
    icon: Coffee
  },
  {
    id: 4,
    name: 'Computer Science Block',
    category: 'Academic',
    description: 'Computer science classrooms, labs and faculty offices.',
    lat: 30.3177,
    lng: 78.0315,
    hours: '9:00 AM - 5:00 PM',
    icon: GraduationCap
  },
  {
    id: 5,
    name: 'Sports Ground',
    category: 'Sports',
    description: 'Outdoor sports and recreational activities.',
    lat: 30.3152,
    lng: 78.0310,
    hours: '6:00 AM - 7:00 PM',
    icon: Dumbbell
  },
  {
    id: 6,
    name: 'Student Hostel',
    category: 'Hostel',
    description: 'Student residential accommodation.',
    lat: 30.3183,
    lng: 78.0338,
    hours: 'Open 24 hours',
    icon: Home
  },
  {
    id: 7,
    name: 'Administration Office',
    category: 'Academic',
    description: 'Administrative support, admissions and student services.',
    lat: 30.3160,
    lng: 78.0304,
    hours: '9:30 AM - 4:30 PM',
    icon: Building2
  },
  {
    id: 8,
    name: 'Science Laboratory',
    category: 'Academic',
    description: 'Laboratory facilities for practical sessions and experiments.',
    lat: 30.3180,
    lng: 78.0302,
    hours: '9:00 AM - 5:00 PM',
    icon: Building2
  }
]

const categories = [
  'All',
  'Academic',
  'Library',
  'Food',
  'Sports',
  'Hostel'
]

const categoryIcons = {
  All: Compass,
  Academic: GraduationCap,
  Library: BookOpen,
  Food: Coffee,
  Sports: Dumbbell,
  Hostel: Home
}

// Move map when a location is selected

function MapController({ selected, routeCoordinates }) {
  const map = useMap()

  useEffect(() => {
    if (routeCoordinates?.length > 1) {
      map.fitBounds(routeCoordinates, {
        padding: [50, 50],
        maxZoom: 18
      })
    } else if (selected) {
      map.flyTo(
        [selected.lat, selected.lng],
        17,
        { duration: 1 }
      )
    }
  }, [selected, routeCoordinates, map])

  return null
}


function App() {
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState('All')
  const [selected, setSelected] = useState(null)
  const [menuOpen, setMenuOpen] = useState(false)

const [startPoint, setStartPoint] = useState('')
const [endPoint, setEndPoint] = useState('')

const [routeData, setRouteData] = useState(null)
const [routeLoading, setRouteLoading] = useState(false)
const [routeError, setRouteError] = useState('')

  const filteredLocations = useMemo(() => {
    return locations.filter((location) => {
      const matchesSearch =
        location.name.toLowerCase().includes(search.toLowerCase()) ||
        location.category.toLowerCase().includes(search.toLowerCase())

      const matchesCategory =
        activeCategory === 'All' ||
        location.category === activeCategory

      return matchesSearch && matchesCategory
    })
  }, [search, activeCategory])

  const routeStart = locations.find(
    (location) => location.id === Number(startPoint)
  )

  const routeEnd = locations.find(
    (location) => location.id === Number(endPoint)
  )

  const routeCoordinates = routeData?.coordinates || []

async function handleRoute() {
  if (!startPoint || !endPoint) {
    setRouteError('Please select both locations.')
    return
  }

  if (startPoint === endPoint) {
    setRouteError('Choose two different locations.')
    return
  }

  const start = locations.find(
    item => item.id === Number(startPoint)
  )

  const end = locations.find(
    item => item.id === Number(endPoint)
  )

  if (!start || !end) {
    setRouteError('Location not found.')
    return
  }

  setRouteLoading(true)
  setRouteError('')
  setRouteData(null)

  try {
    const coordinates =
      `${start.lng},${start.lat};${end.lng},${end.lat}`

    const url =
      `https://routing.openstreetmap.de/routed-foot/route/v1/driving/${coordinates}` +
      '?overview=full&geometries=geojson&steps=true'

    const response = await fetch(url)

    if (!response.ok) {
      throw new Error('Routing service unavailable.')
    }

    const data = await response.json()

    if (data.code !== 'Ok' || !data.routes?.length) {
      throw new Error('No walking route found between these locations.')
    }

    const route = data.routes[0]

    setRouteData({
      coordinates: route.geometry.coordinates.map(
        ([lng, lat]) => [lat, lng]
      ),
      distance: route.distance,
      duration: route.duration,
      steps: route.legs?.flatMap(leg => leg.steps || []) || []
    })

  } catch (error) {
    setRouteError(
      error.message || 'Unable to calculate route.'
    )
  } finally {
    setRouteLoading(false)
  }
}

function clearRoute() {
  setRouteData(null)
  setRouteError('')
  setStartPoint('')
  setEndPoint('')
}

  return (
    <div className="app">

      {/* SIDEBAR */}

      <aside className={`sidebar ${menuOpen ? 'sidebar-open' : ''}`}>

        <div className="brand">
          <div className="brand-icon">
            <Navigation size={24} />
          </div>

          <div>
            <h2>CampusNavigator</h2>
            <span>SMART CAMPUS GUIDE</span>
          </div>

          <button
            className="close-menu"
            onClick={() => setMenuOpen(false)}
          >
            <X size={20} />
          </button>
        </div>

        <div className="welcome">
          <p className="eyebrow">WELCOME TO YOUR CAMPUS</p>
          <h1>Find your way<br />around campus.</h1>
          <p>Explore buildings, discover facilities and navigate with ease.</p>
        </div>

        {/* SEARCH */}

        <div className="search-box">
          <Search size={19} />

          <input
            type="text"
            placeholder="Search places..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          {search && (
            <button onClick={() => setSearch('')}>
              <X size={16} />
            </button>
          )}
        </div>

        {/* CATEGORIES */}

        <div className="section-heading">
          <h3>EXPLORE CATEGORIES</h3>
        </div>

        <div className="categories">
          {categories.map((category) => {
            const Icon = categoryIcons[category]

            return (
              <button
                key={category}
                className={`category-btn ${
                  activeCategory === category ? 'active' : ''
                }`}
                onClick={() => setActiveCategory(category)}
              >
                <Icon size={17} />
                <span>{category}</span>
              </button>
            )
          })}
        </div>

        {/* LOCATIONS */}

        <div className="section-heading location-heading">
          <h3>CAMPUS LOCATIONS</h3>
          <span>{filteredLocations.length} PLACES</span>
        </div>

        <div className="location-list">
          {filteredLocations.map((location) => {
            const Icon = location.icon

            return (
              <button
                key={location.id}
                className={`location-item ${
                  selected?.id === location.id ? 'selected' : ''
                }`}
                onClick={() => {
                  setSelected(location)
                  setMenuOpen(false)
                }}
              >
                <div className="location-icon">
                  <Icon size={19} />
                </div>

                <div className="location-text">
                  <h4>{location.name}</h4>
                  <span>{location.category}</span>
                </div>

                <ArrowRight size={16} className="location-arrow" />
              </button>
            )
          })}

          {filteredLocations.length === 0 && (
            <div className="empty-state">
              <Search size={25} />
              <p>No locations found.</p>
              <span>Try another search.</span>
            </div>
          )}
        </div>

        <div className="sidebar-footer">
          <MapPin size={16} />
          <span>Campus Explorer · Demo Version</span>
        </div>

      </aside>

      {/* MAIN CONTENT */}

      <main className="main-content">

        <header className="topbar">

          <div className="topbar-left">
            <button
              className="menu-toggle"
              onClick={() => setMenuOpen(true)}
            >
              <Menu size={22} />
            </button>

            <div>
              <p className="topbar-label">CAMPUS DIRECTORY</p>
              <h2>Explore Campus</h2>
            </div>
          </div>

          <div className="topbar-right">
            <span className="status-dot"></span>
            <span>Interactive Campus Map</span>
          </div>

        </header>

        {/* MAP */}

        <section className="map-section">

          <div className="map-heading">
            <div>
              <h2>Campus Map</h2>
              <p>Select any marker to explore a location.</p>
            </div>

            <button
              className="reset-btn"
              onClick={() => {
                setSelected(null)
                clearRoute()
              }}
            >
              <LocateFixed size={16} />
              Reset map
            </button>
          </div>

          <div className="map-wrapper">

            <MapContainer
              center={[30.3165, 78.0322]}
              zoom={17}
              scrollWheelZoom={true}
              className="campus-map"
            >

              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              <MapController
              selected={selected}
              routeCoordinates={routeCoordinates}
              />

              {filteredLocations.map((location) => (
                <CircleMarker
                  key={location.id}
                  center={[location.lat, location.lng]}
                  radius={selected?.id === location.id ? 11 : 8}
                  pathOptions={{
                    color: '#ffffff',
                    weight: 3,
                    fillColor:
                      selected?.id === location.id
                        ? '#f97316'
                        : '#2563eb',
                    fillOpacity: 1
                  }}
                  eventHandlers={{
                    click: () => setSelected(location)
                  }}
                >
                  <Popup>
                    <strong>{location.name}</strong>
                    <br />
                    {location.category}
                  </Popup>
                </CircleMarker>
              ))}

{routeData && (
  <Polyline
    positions={routeCoordinates}
    pathOptions={{
      color: '#2563eb',
      weight: 6,
      opacity: 0.9
    }}
  />
)}

            </MapContainer>

            <div className="map-legend">
              <div>
                <span className="legend-dot blue"></span>
                <span>Campus locations</span>
              </div>
              <div>
                <span className="legend-dot orange"></span>
                <span>Selected location</span>
              </div>
            </div>

          </div>

        </section>

        {/* ROUTE PLANNER */}

        <section className="route-section">

          <div className="route-title">
            <div className="route-icon">
              <Route size={21} />
            </div>

            <div>
              <h3>Plan Your Route</h3>
              <p>Choose where you want to go.</p>
            </div>
          </div>

          <div className="route-form">

            <div className="route-field">
              <label>STARTING POINT</label>

              <select
                value={startPoint}
                onChange={(e) => {
                  setStartPoint(e.target.value)
                  setRouteData(null)
                  setRouteError('')

                }}
              >
                <option value="">Select starting point</option>

                {locations.map((location) => (
                  <option key={location.id} value={location.id}>
                    {location.name}
                  </option>
                ))}
              </select>
            </div>

            <ArrowRight className="route-arrow" size={20} />

            <div className="route-field">
              <label>DESTINATION</label>

              <select
                value={endPoint}
                onChange={(e) => {
                  setEndPoint(e.target.value)
                  setRouteData(null)
                setRouteError('')

                }}
              >
                <option value="">Select destination</option>

                {locations.map((location) => (
                  <option key={location.id} value={location.id}>
                    {location.name}
                  </option>
                ))}
              </select>
            </div>

            <button
            className="find-route-btn"
            onClick={handleRoute}
            disabled={routeLoading}
            >
              <Navigation size={17} />
              {routeLoading ? 'Finding route...' : 'Find Route'}
            </button>

          </div>

          
{routeLoading && (
  <div className="route-result">
    <Footprints size={19} />
    Calculating walking route...
  </div>
)}

{routeError && (
  <div className="route-error">
    <AlertCircle size={18} />
    {routeError}
  </div>
)}

{routeData && routeStart && routeEnd && (
  <div className="route-result">
    <Footprints size={20} />

    <span>
      <strong>Walking route found</strong>
      <br />

      {routeStart.name} → {routeEnd.name}

      <br />

      <small>
        Distance: {(routeData.distance / 1000).toFixed(2)} km
        {' · '}
        Estimated time: {Math.ceil(routeData.duration / 60)} min
      </small>
    </span>

    <button onClick={clearRoute}>
      Clear
    </button>
  </div>
)}


        </section>

        {/* LOCATION DETAILS */}

        <section className="details-section">

          <div className="details-heading">
            <div>
              <p className="topbar-label">LOCATION INFORMATION</p>
              <h2>Explore Places</h2>
            </div>
          </div>

          {selected ? (

            <div className="selected-card">

              <div className="selected-card-icon">
                {(() => {
                  const Icon = selected.icon
                  return <Icon size={30} />
                })()}
              </div>

              <div className="selected-card-content">
                <span className="selected-category">
                  {selected.category}
                </span>

                <h3>{selected.name}</h3>
                <p>{selected.description}</p>

                <div className="opening-time">
                  <Clock size={15} />
                  {selected.hours}
                </div>

                <button
                  className="details-route-btn"
                  onClick={() => {
                    setEndPoint(String(selected.id))
                    setRouteData(null)
                  setRouteError('')

                  }}
                >
                  <Navigation size={16} />
                  Set as destination
                </button>
              </div>

              <button
                className="dismiss-btn"
                onClick={() => setSelected(null)}
              >
                <X size={18} />
              </button>

            </div>

          ) : (

            <div className="details-placeholder">
              <div className="placeholder-icon">
                <MapPin size={27} />
              </div>
              <h3>No location selected</h3>
              <p>Click a map marker or select a campus location to see more information.</p>
            </div>

          )}

        </section>

        <footer className="footer">
          <p>© 2026 CampusNavigator · Designed for smarter campus experiences.</p>
          <span>Powered by OpenStreetMap</span>
        </footer>

      </main>

    </div>
  )
}

export default App
