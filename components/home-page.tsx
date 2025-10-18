'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Star, Clock, Shield, Users, CheckCircle, Play, Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin, Wrench, Zap, Home, ArrowRight } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import type { LucideIcon } from 'lucide-react'

interface Service {
  id: string
  title: string
  description: string
  price: string
  rating: string
  image: string
  icon: LucideIcon
  features: string[]
  included: string[]
  responseTime: string
  availability: string
}

export default function HomePage() {
  const [selectedService, setSelectedService] = useState<Service | null>(null)

  const stats = [
    {
      icon: Users,
      value: '10,000+',
      label: 'Happy Customers',
      description: 'Satisfied customers across the country'
    },
    {
      icon: Star,
      value: '4.9/5',
      label: 'Average Rating',
      description: 'Based on 2,500+ verified reviews'
    },
    {
      icon: Clock,
      value: '24/7',
      label: 'Support Available',
      description: 'Round-the-clock customer assistance'
    },
    {
      icon: Shield,
      value: '100%',
      label: 'Verified Professionals',
      description: 'All service providers are background checked'
    }
  ]

  const services: Service[] = [
    {
      id: 'plumbing',
      title: 'Plumbing Services',
      description: 'Professional plumbing services for repairs, installations, and maintenance.',
      price: '₹85',
      rating: '4.8',
      image: '/placeholder.jpg',
      icon: Wrench,
      features: [
        'Emergency plumbing repairs',
        'Pipe installation and replacement',
        'Drain cleaning and unclogging',
        'Water heater repair and installation',
        'Bathroom and kitchen plumbing',
        'Leak detection and repair'
      ],
      included: [
        'Professional assessment',
        'Quality parts and materials',
        '30-day warranty on work',
        'Clean-up after service'
      ],
      responseTime: '30 minutes',
      availability: '24/7 Emergency Service'
    },
    {
      id: 'electrical',
      title: 'Electrical Services',
      description: 'Licensed electricians for all your electrical needs, from repairs to installations.',
      price: '₹95',
      rating: '4.8',
      image: '/placeholder.jpg',
      icon: Zap,
      features: [
        'Electrical wiring and rewiring',
        'Switch and outlet installation',
        'Ceiling fan installation',
        'Light fixture installation',
        'Electrical panel upgrades',
        'Safety inspections'
      ],
      included: [
        'Licensed electrician',
        'Safety compliance check',
        '1-year warranty',
        'Emergency response available'
      ],
      responseTime: '45 minutes',
      availability: 'Mon-Sat, 8AM-8PM'
    },
    {
      id: 'cleaning',
      title: 'Home Cleaning',
      description: 'Thorough cleaning services to keep your home spotless and healthy.',
      price: '₹120',
      rating: '4.8',
      image: '/placeholder.jpg',
      icon: Home,
      features: [
        'Deep house cleaning',
        'Bathroom and kitchen sanitization',
        'Floor mopping and vacuuming',
        'Dusting and wiping surfaces',
        'Window cleaning (interior)',
        'Trash removal'
      ],
      included: [
        'Eco-friendly cleaning products',
        'Professional cleaning equipment',
        'Bonded and insured cleaners',
        'Satisfaction guarantee'
      ],
      responseTime: '2 hours',
      availability: 'Daily, 7AM-7PM'
    }
  ]

  const features = [
    {
      icon: Shield,
      title: 'Verified Professionals',
      description: 'All our service providers are thoroughly background checked and verified for your safety and peace of mind.'
    },
    {
      icon: Clock,
      title: 'Quick Response Time',
      description: 'Get connected with available professionals in your area within minutes, not hours or days.'
    },
    {
      icon: Star,
      title: 'Quality Guarantee',
      description: 'We stand behind our work with a satisfaction guarantee. If you\'re not happy, we\'ll make it right.'
    }
  ]

  const additionalFeatures = [
    {
      icon: Users,
      title: '24/7 Customer Support',
      description: 'Round-the-clock assistance whenever you need help or have questions.'
    },
    {
      icon: CheckCircle,
      title: 'Easy Booking Process',
      description: 'Simple and intuitive booking system that gets you connected quickly.'
    },
    {
      icon: Shield,
      title: 'Secure Payments',
      description: 'Safe and secure payment processing with multiple payment options.'
    }
  ]

  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'Homeowner',
      content: 'FixItNow made finding a reliable plumber so easy! The service was prompt, professional, and exactly what I needed. I\'ll definitely be using them again.',
      avatar: '/placeholder-user.jpg'
    },
    {
      name: 'Michael Chen',
      role: 'Apartment Resident',
      content: 'I\'ve used FixItNow for both electrical and cleaning services. Their professionals are always on time and do excellent work. Highly recommended!',
      avatar: '/placeholder-user.jpg'
    },
    {
      name: 'Emily Rodriguez',
      role: 'Property Manager',
      content: 'As a property manager, I need reliable service providers. FixItNow has been a game-changer for our maintenance needs. Fast, efficient, and high-quality work.',
      avatar: '/placeholder-user.jpg'
    }
  ]

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-slate-800 via-slate-700 to-slate-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/20 to-teal-900/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <Badge className="mb-6 bg-blue-600/20 text-blue-200 border-blue-500/30 hover:bg-blue-600/30">
                ⭐ Trusted by 10,000+ customers
              </Badge>
              
              <h1 className="text-4xl lg:text-6xl font-bold mb-6 leading-tight">
                Quality Home Services, 
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-orange-600">
                  {' '}Just a Click Away
                </span>
              </h1>
              
              <p className="text-xl text-gray-300 mb-8 leading-relaxed">
                From plumbing and electrical to cleaning and gardening, FixItNow connects you with verified professionals for all your home service needs. Get instant quotes and book services in minutes.
              </p>
              
              <p className="text-lg text-orange-400 font-medium mb-8 italic">
                Tap, connect and done
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <CheckCircle className="h-5 w-5 text-green-400 flex-shrink-0 mt-1" />
                <span className="text-gray-300">Verified Professionals</span>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <CheckCircle className="h-5 w-5 text-green-400 flex-shrink-0 mt-1" />
                <span className="text-gray-300">Instant Booking</span>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <CheckCircle className="h-5 w-5 text-green-400 flex-shrink-0 mt-1" />
                <span className="text-gray-300">24/7 Support</span>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/book">
                  <Button 
                    size="lg" 
                    className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-xl hover:shadow-2xl transition-all duration-300 text-lg px-8 py-3 hover:scale-105 hover:-translate-y-1"
                  >
                    Explore Services →
                  </Button>
                </Link>
                
                <Button 
                  size="lg" 
                  className="border-2 border-white bg-transparent text-white hover:bg-white hover:text-slate-900 backdrop-blur-sm text-lg px-8 py-3 hover:scale-105 hover:-translate-y-1 transition-all duration-300"
                >
                  <Play className="mr-2 h-5 w-5" />
                  Watch Demo
                </Button>
              </div>
              
              <div className="flex items-center gap-2 mt-8 text-yellow-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-current" />
                ))}
                <span className="text-white ml-2">4.9/5 from 2,500+ reviews</span>
              </div>
            </div>
            
            <div className="lg:flex justify-center">
              <div className="relative">
                <div className="bg-gray-900 rounded-3xl p-12 shadow-2xl border border-gray-700 max-w-lg w-full min-h-[500px] flex flex-col justify-center hover:scale-105 hover:shadow-3xl transition-all duration-500 hover:border-orange-500/50">
                  <div className="flex items-center justify-center mb-12">
                    <Image
                      src="/logo_app.jpg"
                      alt="FixItNow"
                      width={120}
                      height={120}
                      className="rounded-2xl hover:scale-110 transition-transform duration-300"
                    />
                    <div className="ml-8">
                      <h3 className="text-4xl font-bold text-white hover:text-orange-400 transition-colors duration-300">
                        FixIt<span className="text-orange-500">Now</span>
                      </h3>
                      <p className="text-gray-400 text-xl">Tap, connect and done</p>
                    </div>
                  </div>
                  
                  <div className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300">
                    <div className="flex items-center gap-6 mb-6">
                      <CheckCircle className="h-10 w-10 text-green-500 animate-pulse" />
                      <div>
                        <p className="font-semibold text-gray-900 text-xl">Service Completed</p>
                        <p className="text-gray-600 text-lg">Plumbing repair finished successfully</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <Card key={index} className="text-center border-none shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 cursor-pointer group">
                <CardContent className="p-8">
                  <div className="bg-gradient-to-br from-orange-400 to-orange-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                    <stat.icon className="h-8 w-8 text-white group-hover:scale-110 transition-transform duration-300" />
                  </div>
                  <h3 className="text-3xl font-bold text-gray-900 mb-2 group-hover:text-orange-600 transition-colors duration-300">{stat.value}</h3>
                  <p className="text-lg font-semibold text-gray-700 mb-2 group-hover:text-gray-900 transition-colors duration-300">{stat.label}</p>
                  <p className="text-sm text-gray-600 group-hover:text-gray-700 transition-colors duration-300">{stat.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Our Popular Services</h2>
            <p className="text-xl text-gray-600">
              Professional home services you can trust
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <Card key={index} className="overflow-hidden hover:shadow-2xl hover:-translate-y-3 transition-all duration-500 border-none shadow-lg group cursor-pointer">
                <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center relative overflow-hidden group-hover:from-orange-50 group-hover:to-orange-100 transition-all duration-500">
                  <div className="absolute inset-0 bg-gradient-to-r from-orange-500/0 to-orange-600/0 group-hover:from-orange-500/10 group-hover:to-orange-600/20 transition-all duration-500"></div>
                  <service.icon className="h-16 w-16 text-gray-400 group-hover:text-orange-500 transition-colors duration-300 relative z-10" />
                </div>
                <CardContent className="p-6 group-hover:bg-gradient-to-br group-hover:from-white group-hover:to-orange-50/50 transition-all duration-500">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xl font-bold text-gray-900 group-hover:text-orange-700 transition-colors duration-300">{service.title}</h3>
                    <div className="flex items-center gap-1 group-hover:scale-110 transition-transform duration-300">
                      <Star className="h-4 w-4 text-yellow-400 fill-current group-hover:text-yellow-500 transition-colors duration-300" />
                      <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900 transition-colors duration-300">{service.rating}</span>
                    </div>
                  </div>
                  <p className="text-gray-600 mb-4 group-hover:text-gray-700 transition-colors duration-300">{service.description}</p>
                  <div className="flex items-center justify-between">
                    <div className="group-hover:scale-105 transition-transform duration-300">
                      <span className="text-sm text-gray-500 group-hover:text-gray-600 transition-colors duration-300">Starting from</span>
                      <p className="text-2xl font-bold text-orange-600 group-hover:text-orange-700 transition-colors duration-300">{service.price}</p>
                    </div>
                    <div className="space-y-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="w-full hover:border-orange-500 hover:text-orange-600 hover:bg-orange-50 group-hover:scale-105 transition-all duration-300"
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
                                  {selectedService.features?.map((feature: string, idx: number) => (
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
                                </div>
                              </div>
                            </div>
                            
                            <div className="mt-6 p-4 bg-gradient-to-r from-orange-50 to-orange-100 rounded-lg">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="text-sm text-gray-600">Starting Price</p>
                                  <p className="text-3xl font-bold text-orange-600">{selectedService.price}</p>
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
                        <Button size="sm" className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 group-hover:scale-105 group-hover:shadow-lg transition-all duration-300">
                          Book Now
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose FixItNow Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Why Choose FixItNow?</h2>
          <p className="text-xl text-gray-600 mb-16 max-w-3xl mx-auto">
            We're committed to providing you with the best home service experience possible
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {features.map((feature, index) => (
              <Card key={index} className="text-center border-none shadow-lg hover:shadow-2xl hover:-translate-y-3 transition-all duration-500 group cursor-pointer">
                <CardContent className="p-8 group-hover:bg-gradient-to-br group-hover:from-white group-hover:to-orange-50/30 transition-all duration-500">
                  <div className="bg-gradient-to-br from-orange-400 to-orange-600 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-125 group-hover:rotate-6 group-hover:shadow-lg transition-all duration-500">
                    <feature.icon className="h-10 w-10 text-white group-hover:scale-110 transition-transform duration-300" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4 group-hover:text-orange-700 transition-colors duration-300">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed group-hover:text-gray-700 transition-colors duration-300">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {additionalFeatures.map((feature, index) => (
              <Card key={index} className="text-center border-none shadow-lg hover:shadow-2xl hover:-translate-y-3 transition-all duration-500 group cursor-pointer">
                <CardContent className="p-8 group-hover:bg-gradient-to-br group-hover:from-white group-hover:to-slate-50/50 transition-all duration-500">
                  <div className="bg-gradient-to-br from-slate-600 to-slate-700 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-125 group-hover:rotate-6 group-hover:shadow-lg group-hover:from-slate-700 group-hover:to-slate-800 transition-all duration-500">
                    <feature.icon className="h-10 w-10 text-white group-hover:scale-110 transition-transform duration-300" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4 group-hover:text-slate-700 transition-colors duration-300">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed group-hover:text-gray-700 transition-colors duration-300">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">What Our Customers Say</h2>
            <p className="text-xl text-gray-600">
              Don't just take our word for it - hear from some of our satisfied customers
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="border-none shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 group cursor-pointer">
                <CardContent className="p-8 group-hover:bg-gradient-to-br group-hover:from-white group-hover:to-yellow-50/30 transition-all duration-500">
                  <div className="flex items-center gap-1 mb-4 group-hover:scale-105 transition-transform duration-300">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 text-yellow-400 fill-current group-hover:text-yellow-500 transition-colors duration-300" />
                    ))}
                  </div>
                  <p className="text-gray-600 mb-6 italic leading-relaxed group-hover:text-gray-700 transition-colors duration-300">"{testimonial.content}"</p>
                  <div className="flex items-center gap-4 group-hover:scale-105 transition-transform duration-300">
                    <div className="w-12 h-12 bg-gradient-to-br from-gray-300 to-gray-400 rounded-full flex items-center justify-center group-hover:from-orange-300 group-hover:to-orange-400 transition-all duration-300">
                      <Users className="h-6 w-6 text-gray-600 group-hover:text-white transition-colors duration-300" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 group-hover:text-orange-700 transition-colors duration-300">{testimonial.name}</p>
                      <p className="text-sm text-gray-500 group-hover:text-gray-600 transition-colors duration-300">{testimonial.role}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-slate-800 via-slate-700 to-slate-900 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-xl text-gray-300 mb-8">
            Join thousands of satisfied customers and experience the convenience of FixItNow
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/book">
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-xl hover:shadow-2xl transition-all duration-300 text-lg px-8 py-3 hover:scale-105 hover:-translate-y-1"
              >
                Book a Service Now
              </Button>
            </Link>
            <Link href="/auth/signup">
              <Button 
                size="lg" 
                className="border-2 border-white bg-transparent text-white hover:bg-white hover:text-slate-900 backdrop-blur-sm text-lg px-8 py-3 hover:scale-105 hover:-translate-y-1 transition-all duration-300"
              >
                Join as a Provider
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
            {/* Company Info */}
            <div className="lg:col-span-1">
              <div className="flex items-center space-x-2 mb-6 group">
                <Image
                  src="/logo_app.jpg"
                  alt="FixItNow"
                  width={48}
                  height={48}
                  className="rounded-lg group-hover:scale-110 transition-transform duration-300"
                />
                <span className="text-2xl font-bold group-hover:text-orange-400 transition-colors duration-300">
                  FixIt<span className="text-orange-500">Now</span>
                </span>
              </div>
              <p className="text-gray-300 mb-6 leading-relaxed">
                Your trusted partner for quality home services. Connecting you with verified professionals for all your repair, maintenance, and improvement needs.
              </p>
              <div className="flex space-x-4">
                <Link href="#" className="group">
                  <div className="w-10 h-10 bg-slate-700 rounded-full flex items-center justify-center group-hover:bg-orange-500 transition-all duration-300 group-hover:scale-110">
                    <Facebook className="h-5 w-5 text-gray-300 group-hover:text-white transition-colors duration-300" />
                  </div>
                </Link>
                <Link href="#" className="group">
                  <div className="w-10 h-10 bg-slate-700 rounded-full flex items-center justify-center group-hover:bg-orange-500 transition-all duration-300 group-hover:scale-110">
                    <Twitter className="h-5 w-5 text-gray-300 group-hover:text-white transition-colors duration-300" />
                  </div>
                </Link>
                <Link href="#" className="group">
                  <div className="w-10 h-10 bg-slate-700 rounded-full flex items-center justify-center group-hover:bg-orange-500 transition-all duration-300 group-hover:scale-110">
                    <Instagram className="h-5 w-5 text-gray-300 group-hover:text-white transition-colors duration-300" />
                  </div>
                </Link>
                <Link href="#" className="group">
                  <div className="w-10 h-10 bg-slate-700 rounded-full flex items-center justify-center group-hover:bg-orange-500 transition-all duration-300 group-hover:scale-110">
                    <Linkedin className="h-5 w-5 text-gray-300 group-hover:text-white transition-colors duration-300" />
                  </div>
                </Link>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-lg font-semibold mb-6 text-orange-400">Quick Links</h3>
              <ul className="space-y-3">
                <li>
                  <Link href="/" className="text-gray-300 hover:text-orange-400 transition-colors duration-300 hover:pl-2 transition-all">
                    Home
                  </Link>
                </li>
                <li>
                  <Link href="/services" className="text-gray-300 hover:text-orange-400 transition-colors duration-300 hover:pl-2 transition-all">
                    Services
                  </Link>
                </li>
                <li>
                  <Link href="/about" className="text-gray-300 hover:text-orange-400 transition-colors duration-300 hover:pl-2 transition-all">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="text-gray-300 hover:text-orange-400 transition-colors duration-300 hover:pl-2 transition-all">
                    Contact
                  </Link>
                </li>
                <li>
                  <Link href="/auth/signup" className="text-gray-300 hover:text-orange-400 transition-colors duration-300 hover:pl-2 transition-all">
                    Join as Provider
                  </Link>
                </li>
              </ul>
            </div>

            {/* Services */}
            <div>
              <h3 className="text-lg font-semibold mb-6 text-orange-400">Our Services</h3>
              <ul className="space-y-3">
                <li>
                  <Link href="/services" className="text-gray-300 hover:text-orange-400 transition-colors duration-300 hover:pl-2 transition-all">
                    Plumbing Services
                  </Link>
                </li>
                <li>
                  <Link href="/services" className="text-gray-300 hover:text-orange-400 transition-colors duration-300 hover:pl-2 transition-all">
                    Electrical Services
                  </Link>
                </li>
                <li>
                  <Link href="/services" className="text-gray-300 hover:text-orange-400 transition-colors duration-300 hover:pl-2 transition-all">
                    Home Cleaning
                  </Link>
                </li>
                <li>
                  <Link href="/services" className="text-gray-300 hover:text-orange-400 transition-colors duration-300 hover:pl-2 transition-all">
                    HVAC Services
                  </Link>
                </li>
                <li>
                  <Link href="/services" className="text-gray-300 hover:text-orange-400 transition-colors duration-300 hover:pl-2 transition-all">
                    Appliance Repair
                  </Link>
                </li>
              </ul>
            </div>

            {/* Contact Info */}
            <div>
              <h3 className="text-lg font-semibold mb-6 text-orange-400">Contact Info</h3>
              <div className="space-y-4">
                <div className="flex items-center space-x-3 group">
                  <div className="w-8 h-8 bg-slate-700 rounded-full flex items-center justify-center group-hover:bg-orange-500 transition-all duration-300">
                    <Phone className="h-4 w-4 text-gray-300 group-hover:text-white transition-colors duration-300" />
                  </div>
                  <span className="text-gray-300 group-hover:text-orange-400 transition-colors duration-300">+1 (555) 123-4567</span>
                </div>
                <div className="flex items-center space-x-3 group">
                  <div className="w-8 h-8 bg-slate-700 rounded-full flex items-center justify-center group-hover:bg-orange-500 transition-all duration-300">
                    <Mail className="h-4 w-4 text-gray-300 group-hover:text-white transition-colors duration-300" />
                  </div>
                  <span className="text-gray-300 group-hover:text-orange-400 transition-colors duration-300">support@fixitnow.com</span>
                </div>
                <div className="flex items-center space-x-3 group">
                  <div className="w-8 h-8 bg-slate-700 rounded-full flex items-center justify-center group-hover:bg-orange-500 transition-all duration-300">
                    <MapPin className="h-4 w-4 text-gray-300 group-hover:text-white transition-colors duration-300" />
                  </div>
                  <span className="text-gray-300 group-hover:text-orange-400 transition-colors duration-300">123 Service Street, City, State 12345</span>
                </div>
              </div>

              {/* Newsletter Signup */}
              <div className="mt-8">
                <h4 className="text-md font-semibold mb-4 text-white">Stay Updated</h4>
                <div className="flex space-x-2">
                  <input
                    type="email"
                    placeholder="Your email"
                    className="flex-1 px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-orange-500 transition-colors duration-300"
                  />
                  <Button className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 hover:scale-105 transition-all duration-300">
                    Subscribe
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Footer */}
          <div className="mt-12 pt-8 border-t border-slate-700">
            <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
              <div className="text-gray-400 text-sm">
                © 2024 FixItNow. All rights reserved. Built with ❤️ for better home services.
              </div>
              <div className="flex space-x-6 text-sm">
                <Link href="/privacy" className="text-gray-400 hover:text-orange-400 transition-colors duration-300">
                  Privacy Policy
                </Link>
                <Link href="/terms" className="text-gray-400 hover:text-orange-400 transition-colors duration-300">
                  Terms of Service
                </Link>
                <Link href="/support" className="text-gray-400 hover:text-orange-400 transition-colors duration-300">
                  Support
                </Link>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}