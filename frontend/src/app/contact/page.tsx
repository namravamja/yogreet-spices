"use client"

import { useState } from "react"
import { Mail, Phone, MapPin, Send, Linkedin, Twitter, Github, MessageSquare } from "lucide-react"
import { Navbar, Footer } from "@/components/layout"
import PageHero from "@/components/shared/PageHero"
import { toast } from "sonner"

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    // Simulate form submission (replace with actual API call)
    setTimeout(() => {
      toast.success("Thank you for contacting us! We'll get back to you soon.")
      setFormData({ name: "", email: "", subject: "", message: "" })
      setIsSubmitting(false)
    }, 1000)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const contactInfo = [
    {
      icon: Mail,
      title: "Email Us",
      content: "support@yogreet.com",
      href: "mailto:support@yogreet.com",
    },
    {
      icon: Phone,
      title: "Call Us",
      content: "+91 123 456 7890",
      href: "tel:+911234567890",
    },
    {
      icon: MapPin,
      title: "Visit Us",
      content: "Mumbai, Maharashtra, India",
      href: "#",
    },
  ]

  const socialLinks = [
    {
      icon: Linkedin,
      name: "LinkedIn",
      href: "#",
      color: "bg-blue-600",
      hoverColor: "hover:bg-blue-700",
    },
    {
      icon: Twitter,
      name: "Twitter",
      href: "#",
      color: "bg-blue-400",
      hoverColor: "hover:bg-blue-500",
    },
    {
      icon: Github,
      name: "GitHub",
      href: "#",
      color: "bg-gray-800",
      hoverColor: "hover:bg-gray-900",
    },
  ]

  return (
    <main className="min-h-screen bg-white">
      <Navbar />
      
      <PageHero
        title="Contact Us"
        subtitle="We'd Love to Hear from You"
        description="Have questions? Need support? Get in touch with our team and we'll be happy to help."
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Contact Information */}
          <div className="lg:col-span-1">
            <div className="mb-8">
              <h2 className="text-2xl font-poppins font-semibold text-yogreet-charcoal mb-6">
                Get in Touch
              </h2>
              <p className="text-yogreet-charcoal font-inter mb-8">
                We're here to help! Reach out to us through any of the channels below, and our team will respond as soon as possible.
              </p>
            </div>

            <div className="space-y-6 mb-8">
              {contactInfo.map((info, index) => (
                <a
                  key={index}
                  href={info.href}
                  className="flex items-start gap-4 p-4 bg-yogreet-light-gray rounded-lg hover:bg-yogreet-light-gray/80 transition-colors cursor-pointer group"
                >
                  <div className="w-12 h-12 bg-yogreet-sage/20 rounded-lg flex items-center justify-center shrink-0 group-hover:bg-yogreet-sage/30 transition-colors">
                    <info.icon className="w-6 h-6 text-yogreet-sage" />
                  </div>
                  <div>
                    <h3 className="font-poppins font-semibold text-yogreet-charcoal mb-1">
                      {info.title}
                    </h3>
                    <p className="text-yogreet-charcoal font-inter">
                      {info.content}
                    </p>
                  </div>
                </a>
              ))}
            </div>

            {/* Social Links */}
            <div>
              <h3 className="font-poppins font-semibold text-yogreet-charcoal mb-4">
                Follow Us
              </h3>
              <div className="flex gap-3">
                {socialLinks.map((social, index) => (
                  <a
                    key={index}
                    href={social.href}
                    className={`w-12 h-12 ${social.color} ${social.hoverColor} rounded-lg flex items-center justify-center text-white transition-colors cursor-pointer`}
                    aria-label={social.name}
                  >
                    <social.icon className="w-6 h-6" />
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <div className="bg-yogreet-light-gray rounded-lg p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-yogreet-sage/20 rounded-lg flex items-center justify-center">
                  <MessageSquare className="w-6 h-6 text-yogreet-sage" />
                </div>
                <h2 className="text-2xl font-poppins font-semibold text-yogreet-charcoal">
                  Send us a Message
                </h2>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label
                      htmlFor="name"
                      className="block text-sm font-manrope font-medium text-yogreet-charcoal mb-2"
                    >
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yogreet-sage focus:border-transparent font-inter"
                      placeholder="Enter your name"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-manrope font-medium text-yogreet-charcoal mb-2"
                    >
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yogreet-sage focus:border-transparent font-inter"
                      placeholder="Enter your email"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="subject"
                    className="block text-sm font-manrope font-medium text-yogreet-charcoal mb-2"
                  >
                    Subject <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    required
                    value={formData.subject}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yogreet-sage focus:border-transparent font-inter"
                    placeholder="What is this regarding?"
                  />
                </div>

                <div>
                  <label
                    htmlFor="message"
                    className="block text-sm font-manrope font-medium text-yogreet-charcoal mb-2"
                  >
                    Message <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    required
                    rows={6}
                    value={formData.message}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yogreet-sage focus:border-transparent font-inter resize-none"
                    placeholder="Tell us how we can help you..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-yogreet-sage text-white px-8 py-3 rounded-md font-manrope font-semibold hover:bg-yogreet-sage/90 transition-colors cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      Send Message
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Additional Info */}
            <div className="mt-8 bg-yogreet-light-gray rounded-lg p-6">
              <h3 className="font-poppins font-semibold text-yogreet-charcoal mb-4">
                Business Hours
              </h3>
              <div className="space-y-2 text-yogreet-charcoal font-inter">
                <p><strong>Monday - Friday:</strong> 9:00 AM - 6:00 PM IST</p>
                <p><strong>Saturday:</strong> 10:00 AM - 4:00 PM IST</p>
                <p><strong>Sunday:</strong> Closed</p>
              </div>
              <p className="mt-4 text-yogreet-charcoal/70 font-inter text-sm">
                For urgent matters outside business hours, please send us an email and we'll respond as soon as possible.
              </p>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  )
}

