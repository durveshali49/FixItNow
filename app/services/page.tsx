'use client'

import Navbar from '@/components/navbar'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { 
  Wrench, 
  Zap, 
  Home, 
  Paintbrush, 
  Leaf, 
  Wind, 
  Hammer, 
  Car,
  ShieldCheck,
  Users,
  Clock,
  Star,
  ArrowRight,
  CheckCircle,
  MapPin,
  Phone,
  Shield
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import type { LucideIcon } from 'lucide-react'

interface Service {
  id: string
  title: string
  description: string
  icon: LucideIcon
  rating: number
  reviewCount: number
  startingPrice: number
  features: string[]
  image: string
  providers: number
  responseTime: string
  detailedFeatures?: string[]
  included?: string[]
  availability?: string
}

export default function ServicesPage() {
  const [selectedService, setSelectedService] = useState<Service | null>(null)

  const services: Service[] = [
    {
      id: 'plumbing',
      title: 'Plumbing Services',
      description: 'Professional plumbing services for repairs, installations, and maintenance.',
      icon: Wrench,
      rating: 4.8,
      reviewCount: 1250,
      startingPrice: 85,
      features: ['Emergency repairs', '24/7 availability', 'Licensed professionals', 'Warranty included'],
      detailedFeatures: [
        'Emergency plumbing repairs',
        'Pipe installation and replacement',
        'Drain cleaning and unclogging',
        'Water heater repair and installation',
        'Bathroom and kitchen plumbing',
        'Leak detection and repair',
        'Toilet repair and installation',
        'Faucet and fixture repair'
      ],
      included: [
        'Professional assessment',
        'Quality parts and materials',
        '30-day warranty on work',
        'Clean-up after service',
        'Licensed and insured plumber',
        'Emergency response available'
      ],
      image: '/placeholder.jpg',
      providers: 150,
      responseTime: '30 min',
      availability: '24/7 Emergency Service'
    },
    {
      id: 'electrical',
      title: 'Electrical Services',
      description: 'Licensed electricians for all your electrical needs, from repairs to installations.',
      icon: Zap,
      rating: 4.9,
      reviewCount: 980,
      startingPrice: 95,
      features: ['Safety inspections', 'Code compliance', 'Emergency service', 'Free estimates'],
      detailedFeatures: [
        'Electrical wiring and rewiring',
        'Switch and outlet installation',
        'Ceiling fan installation',
        'Light fixture installation',
        'Electrical panel upgrades',
        'Safety inspections',
        'Circuit breaker repair',
        'Electrical troubleshooting'
      ],
      included: [
        'Licensed electrician',
        'Safety compliance check',
        '1-year warranty',
        'Emergency response available',
        'Code compliance certification',
        'Quality electrical components'
      ],
      image: '/placeholder.jpg',
      providers: 120,
      responseTime: '45 min',
      availability: 'Mon-Sat, 8AM-8PM'
    },
    {
      id: 'cleaning',
      title: 'Home Cleaning',
      description: 'Professional cleaning services to keep your home spotless and healthy.',
      icon: Home,
      rating: 4.7,
      reviewCount: 2100,
      startingPrice: 120,
      features: ['Eco-friendly products', 'Flexible scheduling', 'Bonded & insured', 'Satisfaction guarantee'],
      detailedFeatures: [
        'Deep house cleaning',
        'Bathroom and kitchen sanitization',
        'Floor mopping and vacuuming',
        'Dusting and wiping surfaces',
        'Window cleaning (interior)',
        'Trash removal',
        'Appliance cleaning',
        'Move-in/move-out cleaning'
      ],
      included: [
        'Eco-friendly cleaning products',
        'Professional cleaning equipment',
        'Bonded and insured cleaners',
        'Satisfaction guarantee',
        'Flexible scheduling',
        'Post-cleaning inspection'
      ],
      image: '/placeholder.jpg',
      providers: 300,
      responseTime: '2 hours',
      availability: 'Daily, 7AM-7PM'
    },
    {
      id: 'painting',
      title: 'Painting Services',
      description: 'Professional painting and touch-up services for interior and exterior surfaces.',
      icon: Paintbrush,
      rating: 4.6,
      reviewCount: 750,
      startingPrice: 250,
      features: ['Premium paints', 'Color consultation', 'Prep work included', '5-year warranty'],
      detailedFeatures: [
        'Interior and exterior painting',
        'Wall preparation and priming',
        'Color consultation and matching',
        'Trim and detail work',
        'Texture and decorative finishes',
        'Cabinet painting and refinishing',
        'Deck and fence staining',
        'Wallpaper removal'
      ],
      included: [
        'Premium quality paints',
        'Professional painting tools',
        'Surface preparation',
        '5-year warranty',
        'Color consultation',
        'Clean-up and disposal'
      ],
      image: '/placeholder.jpg',
      providers: 80,
      responseTime: '1 day',
      availability: 'Mon-Sat, 8AM-6PM'
    },
    {
      id: 'landscaping',
      title: 'Gardening & Landscaping',
      description: 'Expert gardening and landscaping services to beautify your outdoor spaces.',
      icon: Leaf,
      rating: 4.5,
      reviewCount: 650,
      startingPrice: 150,
      features: ['Design consultation', 'Plant selection', 'Maintenance plans', 'Seasonal services'],
      detailedFeatures: [
        'Garden design and planning',
        'Plant selection and installation',
        'Lawn care and maintenance',
        'Tree and shrub pruning',
        'Irrigation system installation',
        'Landscape lighting',
        'Seasonal cleanup',
        'Pest and disease control'
      ],
      included: [
        'Design consultation',
        'Quality plants and materials',
        'Professional installation',
        'Maintenance guidance',
        'Seasonal care tips',
        '6-month plant warranty'
      ],
      image: '/placeholder.jpg',
      providers: 95,
      responseTime: '3 hours',
      availability: 'Daily, 7AM-5PM'
    },
    {
      id: 'hvac',
      title: 'HVAC Services',
      description: 'Heating, ventilation, and air conditioning services for comfort year-round.',
      icon: Wind,
      rating: 4.8,
      reviewCount: 890,
      startingPrice: 110,
      features: ['Energy audits', 'Preventive maintenance', 'Emergency repairs', 'System upgrades'],
      detailedFeatures: [
        'AC installation and repair',
        'Heating system maintenance',
        'Duct cleaning and sealing',
        'Thermostat installation',
        'Energy efficiency audits',
        'Air quality improvement',
        'Emergency HVAC repairs',
        'System replacement and upgrades'
      ],
      included: [
        'Certified HVAC technicians',
        'Energy efficiency assessment',
        'Preventive maintenance plan',
        '1-year service warranty',
        'Emergency response available',
        'System performance optimization'
      ],
      image: '/placeholder.jpg',
      providers: 75,
      responseTime: '1 hour',
      availability: '24/7 Emergency Service'
    },
    {
      id: 'handyman',
      title: 'Handyman Services',
      description: 'General home repairs and maintenance for all your household needs.',
      icon: Hammer,
      rating: 4.7,
      reviewCount: 1400,
      startingPrice: 70,
      features: ['Multi-skilled experts', 'Same-day service', 'Tool included', 'No job too small'],
      detailedFeatures: [
        'Furniture assembly',
        'Wall mounting and hanging',
        'Door and window repairs',
        'Drywall patching',
        'Cabinet and drawer repairs',
        'Shelf installation',
        'Minor electrical and plumbing',
        'Home improvement projects'
      ],
      included: [
        'Professional tools provided',
        'Multi-skilled handyman',
        'Same-day availability',
        'Quality workmanship guarantee',
        'Clean-up after work',
        'Honest pricing'
      ],
      image: '/placeholder.jpg',
      providers: 200,
      responseTime: '1 hour',
      availability: 'Daily, 8AM-8PM'
    },
    {
      id: 'automotive',
      title: 'Mobile Car Services',
      description: 'Convenient mobile car wash, detailing, and maintenance services.',
      icon: Car,
      rating: 4.6,
      reviewCount: 560,
      startingPrice: 60,
      features: ['Mobile service', 'Eco-friendly products', 'Interior & exterior', 'Flexible timing'],
      detailedFeatures: [
        'Mobile car wash and detailing',
        'Interior deep cleaning',
        'Exterior wax and polish',
        'Engine bay cleaning',
        'Headlight restoration',
        'Tire cleaning and shine',
        'Upholstery cleaning',
        'Paint protection services'
      ],
      included: [
        'Mobile service at your location',
        'Eco-friendly cleaning products',
        'Professional detailing equipment',
        'Interior and exterior service',
        'Flexible scheduling',
        'Satisfaction guarantee'
      ],
      image: '/placeholder.jpg',
      providers: 45,
      responseTime: '2 hours',
      availability: 'Daily, 8AM-6PM'
    }
  ]

  const categories = [
    { name: 'All Services', count: services.length, active: true },
    { name: 'Home Repairs', count: 4 },
    { name: 'Cleaning', count: 2 },
    { name: 'Outdoor', count: 2 },
    { name: 'Emergency', count: 3 }
  ]

  const benefits = [
    {
      icon: ShieldCheck,
      title: 'Verified Professionals',
      description: 'All service providers are background-checked and verified'
    },
    {
      icon: Star,
      title: 'Quality Guaranteed',
      description: 'Satisfaction guarantee with every service booking'
    },
    {
      icon: Clock,
      title: 'Fast Response',
      description: 'Quick response times and flexible scheduling'
    },
    {
      icon: Users,
      title: 'Trusted Network',
      description: 'Access to thousands of experienced professionals'
    }
  ]

  return (
    <div>
      <Navbar />
      
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-orange-50 via-white to-orange-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Our <span className="text-orange-500">Services</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              Browse through our comprehensive range of home and lifestyle services. 
              Connect with verified professionals who deliver quality work at fair prices.
            </p>
            <div className="flex flex-wrap justify-center gap-4 mb-8">
              {categories.map((category, index) => (
                <Badge 
                  key={index}
                  variant={category.active ? "default" : "secondary"}
                  className={`px-4 py-2 cursor-pointer text-sm ${
                    category.active 
                      ? 'bg-orange-500 hover:bg-orange-600' 
                      : 'hover:bg-gray-200'
                  }`}
                >
                  {category.name} ({category.count})
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => (
              <div key={index} className="text-center">
                <div className="bg-orange-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <benefit.icon className="h-8 w-8 text-orange-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{benefit.title}</h3>
                <p className="text-gray-600 text-sm">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Services Grid */}
      <div className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {services.map((service) => (
              <Card key={service.id} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 bg-white">
                <div className="relative h-48 bg-gray-200 rounded-t-lg overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-orange-400 to-orange-600 opacity-90"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <service.icon className="h-16 w-16 text-white" />
                  </div>
                  <Badge className="absolute top-3 right-3 bg-white text-gray-900">
                    <Star className="h-3 w-3 mr-1 fill-yellow-400 text-yellow-400" />
                    {service.rating}
                  </Badge>
                </div>
                
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{service.title}</h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">{service.description}</p>
                  
                  <div className="flex items-center text-sm text-gray-500 mb-4">
                    <Users className="h-4 w-4 mr-1" />
                    <span className="mr-4">{service.providers} providers</span>
                    <Clock className="h-4 w-4 mr-1" />
                    <span>{service.responseTime}</span>
                  </div>

                  <div className="space-y-2 mb-4">
                    {service.features.slice(0, 2).map((feature, index) => (
                      <div key={index} className="flex items-center text-sm text-gray-600">
                        <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>

                  <div className="border-t pt-4">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <span className="text-sm text-gray-600">Starting from</span>
                        <div className="text-2xl font-bold text-orange-600">
                          ${service.startingPrice}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-500">
                          {service.reviewCount} reviews
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            className="w-full text-gray-600 hover:text-gray-900 hover:border-orange-500 hover:bg-orange-50"
                            onClick={() => setSelectedService(service)}
                          >
                            View Details →
                          </Button>
                        </DialogTrigger>
                        {selectedService && (
                          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle className="flex items-center gap-3 text-2xl">
                                <selectedService.icon className="h-8 w-8 text-orange-500" />
                                {selectedService.title}
                              </DialogTitle>
                              <DialogDescription className="text-lg">
                                {selectedService.description}
                              </DialogDescription>
                            </DialogHeader>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                              <div>
                                <h4 className="font-semibold text-lg mb-3 text-gray-900">Service Includes:</h4>
                                <ul className="space-y-2">
                                  {selectedService.detailedFeatures?.map((feature: string, idx: number) => (
                                    <li key={idx} className="flex items-start gap-2">
                                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                                      <span className="text-sm text-gray-700">{feature}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                              
                              <div>
                                <h4 className="font-semibold text-lg mb-3 text-gray-900">What's Included:</h4>
                                <ul className="space-y-2 mb-4">
                                  {selectedService.included?.map((item: string, idx: number) => (
                                    <li key={idx} className="flex items-start gap-2">
                                      <Shield className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                                      <span className="text-sm text-gray-700">{item}</span>
                                    </li>
                                  ))}
                                </ul>
                                
                                <div className="space-y-3">
                                  <div className="flex items-center gap-2">
                                    <Clock className="h-4 w-4 text-orange-500" />
                                    <span className="text-sm"><strong>Response Time:</strong> {selectedService.responseTime}</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Users className="h-4 w-4 text-orange-500" />
                                    <span className="text-sm"><strong>Availability:</strong> {selectedService.availability}</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Star className="h-4 w-4 text-yellow-500 fill-current" />
                                    <span className="text-sm"><strong>Rating:</strong> {selectedService.rating}/5</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Users className="h-4 w-4 text-orange-500" />
                                    <span className="text-sm"><strong>Providers:</strong> {selectedService.providers} available</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                            
                            <div className="mt-6 p-4 bg-gradient-to-r from-orange-50 to-orange-100 rounded-lg">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="text-sm text-gray-600">Starting Price</p>
                                  <p className="text-3xl font-bold text-orange-600">${selectedService.startingPrice}</p>
                                  <p className="text-xs text-gray-500">Final price may vary based on requirements</p>
                                </div>
                                <Link href="/book">
                                  <Button className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-lg hover:shadow-xl transition-all duration-300">
                                    <ArrowRight className="h-4 w-4 mr-2" />
                                    Book Now
                                  </Button>
                                </Link>
                              </div>
                            </div>
                          </DialogContent>
                        )}
                      </Dialog>
                      
                      <Link href="/book">
                        <Button className="w-full bg-orange-500 hover:bg-orange-600 text-white">
                          Book Now
                          <ArrowRight className="h-4 w-4 ml-2" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600">
              Get your service booked in just a few simple steps
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-orange-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-orange-600">1</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Choose Service</h3>
              <p className="text-gray-600">Select the service you need from our comprehensive list</p>
            </div>

            <div className="text-center">
              <div className="bg-orange-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-orange-600">2</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Book & Schedule</h3>
              <p className="text-gray-600">Choose your preferred time and provide service details</p>
            </div>

            <div className="text-center">
              <div className="bg-orange-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-orange-600">3</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Get Service</h3>
              <p className="text-gray-600">Our verified professional arrives and completes the job</p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-16 bg-gradient-to-r from-orange-500 to-orange-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
            Need a Custom Service?
          </h2>
          <p className="text-xl text-orange-100 mb-8 max-w-2xl mx-auto">
            Can't find what you're looking for? Contact us and we'll help you find the right professional for any job.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/contact">
              <Button className="bg-white text-orange-600 px-8 py-4 text-lg hover:bg-gray-100 shadow-lg hover:shadow-xl">
                <Phone className="h-5 w-5 mr-2" />
                Contact Us
              </Button>
            </Link>
            <Link href="/auth/signup">
              <Button variant="outline" className="border-2 border-white text-white px-8 py-4 text-lg hover:bg-white hover:text-orange-600">
                <MapPin className="h-5 w-5 mr-2" />
                Join as Provider
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}