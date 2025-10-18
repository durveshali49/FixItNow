import Navbar from '@/components/navbar'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Home, 
  Users, 
  Shield, 
  Clock, 
  Star, 
  CheckCircle, 
  Heart,
  Target,
  Award,
  TrendingUp
} from 'lucide-react'
import Image from 'next/image'

export default function AboutPage() {
  const stats = [
    { icon: Users, label: "Active Users", value: "10,000+" },
    { icon: Home, label: "Services Completed", value: "50,000+" },
    { icon: Star, label: "Average Rating", value: "4.8/5" },
    { icon: Shield, label: "Verified Providers", value: "2,500+" }
  ]

  const values = [
    {
      icon: Shield,
      title: "Trust & Safety",
      description: "All service providers are thoroughly vetted and verified to ensure your safety and peace of mind."
    },
    {
      icon: Clock,
      title: "Reliability",
      description: "We guarantee prompt, professional service delivery that fits your schedule and expectations."
    },
    {
      icon: Heart,
      title: "Customer First",
      description: "Your satisfaction is our priority. We're committed to exceptional service and support."
    },
    {
      icon: Target,
      title: "Quality Assurance",
      description: "We maintain high standards through continuous monitoring and feedback systems."
    }
  ]

  const milestones = [
    { year: "2020", title: "Founded", description: "FixItNow was established with a vision to revolutionize home services" },
    { year: "2021", title: "First 1,000 Users", description: "Reached our first major milestone of connecting 1,000 homeowners" },
    { year: "2022", title: "Service Expansion", description: "Expanded to 10+ service categories across multiple cities" },
    { year: "2023", title: "Trust & Safety", description: "Launched comprehensive verification system for all providers" },
    { year: "2024", title: "50K+ Services", description: "Celebrated 50,000 successful service completions" },
    { year: "2025", title: "Innovation Focus", description: "Continuously improving with AI-powered matching and instant booking" }
  ]

  return (
    <div>
      <Navbar />
      
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-orange-50 via-white to-orange-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <Badge className="mb-4 bg-orange-100 text-orange-700 border-orange-200">
                About FixItNow
              </Badge>
              <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
                About <span className="text-orange-500">FixIt</span><span className="text-gray-900">Now</span>
              </h1>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                We're on a mission to make home services simple, reliable, and accessible for everyone. 
                Since 2020, we've been connecting homeowners with trusted professionals across the country.
              </p>
              <div className="flex flex-wrap gap-4">
                <Badge variant="secondary" className="text-sm px-4 py-2">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Verified Professionals
                </Badge>
                <Badge variant="secondary" className="text-sm px-4 py-2">
                  <Shield className="h-4 w-4 mr-2" />
                  Safe & Secure
                </Badge>
                <Badge variant="secondary" className="text-sm px-4 py-2">
                  <Star className="h-4 w-4 mr-2" />
                  Top Rated Service
                </Badge>
              </div>
            </div>
            <div className="relative">
              <div className="bg-white rounded-2xl shadow-2xl p-8 transform rotate-2 hover:rotate-0 transition-transform duration-300">
                <div className="grid grid-cols-2 gap-6">
                  {stats.map((stat, index) => (
                    <div key={index} className="text-center">
                      <stat.icon className="h-8 w-8 mx-auto mb-3 text-orange-500" />
                      <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                      <div className="text-sm text-gray-600">{stat.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Our Story Section */}
      <div className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">Our Story</h2>
            <div className="w-24 h-1 bg-orange-500 mx-auto mb-8"></div>
          </div>

          <div className="prose prose-lg mx-auto text-gray-600 leading-relaxed">
            <p className="text-xl mb-8">
              FixItNow was born from a simple frustration: finding reliable home service professionals 
              shouldn't be a gamble. Our founder, <strong>Sarah Johnson</strong>, experienced firsthand the challenges of 
              finding trustworthy contractors after a series of disappointing experiences with unreliable 
              service providers.
            </p>
            
            <p className="mb-8">
              Determined to solve this problem for millions of homeowners, Sarah envisioned a platform where 
              people could find and book verified, skilled professionals who take pride in their work. 
              Today, FixItNow serves thousands of customers, connecting them with verified professionals 
              who are committed to excellence.
            </p>

            <p className="mb-8">
              What started as a local solution has grown into a nationwide platform, but our core mission 
              remains the same: <strong>making home services simple, reliable, and accessible for everyone</strong>.
            </p>
          </div>
        </div>
      </div>

      {/* Values Section */}
      <div className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">Our Values</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              These core principles guide everything we do and shape the experience for both 
              customers and service providers on our platform.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300 group">
                <CardContent className="p-6 text-center">
                  <div className="bg-orange-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 group-hover:bg-orange-500 transition-colors duration-300">
                    <value.icon className="h-8 w-8 text-orange-600 group-hover:text-white transition-colors duration-300" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">{value.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{value.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Timeline Section */}
      <div className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">Our Journey</h2>
            <p className="text-xl text-gray-600">
              From a simple idea to a thriving platform connecting thousands of users
            </p>
          </div>

          <div className="relative">
            <div className="absolute left-1/2 transform -translate-x-1/2 w-1 bg-orange-200 h-full"></div>
            
            {milestones.map((milestone, index) => (
              <div key={index} className={`relative flex items-center mb-12 ${index % 2 === 0 ? 'justify-start' : 'justify-end'}`}>
                <div className={`w-5/12 ${index % 2 === 0 ? 'pr-8 text-right' : 'pl-8 text-left'}`}>
                  <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
                    <CardContent className="p-6">
                      <div className="text-2xl font-bold text-orange-600 mb-2">{milestone.year}</div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">{milestone.title}</h3>
                      <p className="text-gray-600">{milestone.description}</p>
                    </CardContent>
                  </Card>
                </div>
                
                <div className="absolute left-1/2 transform -translate-x-1/2 w-4 h-4 bg-orange-500 rounded-full border-4 border-white shadow-lg"></div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20 bg-gradient-to-r from-orange-500 to-orange-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
            Ready to Experience the Difference?
          </h2>
          <p className="text-xl text-orange-100 mb-8 max-w-2xl mx-auto">
            Join thousands of satisfied customers who trust FixItNow for their home service needs. 
            Get started today and discover why we're the preferred choice for quality home services.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href="/auth/signup" 
              className="bg-white text-orange-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-colors duration-300 shadow-lg hover:shadow-xl"
            >
              Get Started Today
            </a>
            <a 
              href="/services" 
              className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-white hover:text-orange-600 transition-colors duration-300"
            >
              Browse Services
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}