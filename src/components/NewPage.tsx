import { useEffect, useState, useRef } from "react"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { SectionHeader } from "@/components/ui/sectionheader"
import { InputWithButton } from "@/components/ui/input-with-button"
import { Input } from "@/components/ui/input"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardLink } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Testimonial } from "@/components/ui/testimonial"
import { Navbar } from "./ui/navbar"

export function NewPage() {
  const [visibleCards, setVisibleCards] = useState<boolean[]>([false, false, false, false])
  const [isSection2Visible, setIsSection2Visible] = useState(false)
  const [lineCoords, setLineCoords] = useState({ x1: 0, x2: 0, y: 0, length: 0 })
  const [centeredTestimonial, setCenteredTestimonial] = useState<number | null>(1)
  const [showNavInput, setShowNavInput] = useState(false)
  const cardRefs = useRef<(HTMLDivElement | null)[]>([])
  const section2Ref = useRef<HTMLDivElement | null>(null)
  const tradeImageRefs = useRef<(HTMLDivElement | null)[]>([])
  const tradesSectionRef = useRef<HTMLDivElement | null>(null)
  const applyRef = useRef<HTMLButtonElement | null>(null)
  const approvedRef = useRef<HTMLButtonElement | null>(null)
  const earningRef = useRef<HTMLButtonElement | null>(null)
  const processContainerRef = useRef<HTMLDivElement | null>(null)
  const testimonialRefs = useRef<(HTMLDivElement | null)[]>([])
  const testimonialContainerRef = useRef<HTMLDivElement | null>(null)
  const heroInputRef = useRef<HTMLDivElement | null>(null)

  // GSAP ScrollTrigger animation for hero images to cards transformation
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger)

    if (!tradesSectionRef.current || tradeImageRefs.current.length === 0) return

    const mm = gsap.matchMedia()

    mm.add("(min-width: 768px)", () => {
      // Fixed scattered positions in hero (organic asymmetric pattern)
      // Opacity based on size ranges for depth perception
      // Small: 0.2, Medium: 0.4, Larger: 0.6, Largest: 0.8
      // More clustered pattern with asymmetric distribution
      const scatteredPositions: Array<{ x: number; y: number; scale: number; opacity: number }> = [
        // Upper left cluster
        { x: -800, y: -350, scale: 0.14, opacity: 0.4 },
        { x: -600, y: -280, scale: 0.10, opacity: 0.2 },
        { x: -450, y: -400, scale: 0.19, opacity: 0.6 },
        { x: -900, y: -200, scale: 0.12, opacity: 0.2 },
        
        // Upper center-right
        { x: 150, y: -320, scale: 0.18, opacity: 0.6 },
        { x: 350, y: -280, scale: 0.16, opacity: 0.4 },
        { x: 550, y: -380, scale: 0.11, opacity: 0.2 },
        
        // Far upper right (off-screen)
        { x: 1100, y: -450, scale: 0.08, opacity: 0.2 },
        { x: 1300, y: -250, scale: 0.13, opacity: 0.2 },
        
        // Middle left
        { x: -750, y: 50, scale: 0.15, opacity: 0.4 },
        { x: -550, y: -50, scale: 0.20, opacity: 0.8 },
        { x: -350, y: 80, scale: 0.17, opacity: 0.6 },
        
        // Center area (most visible)
        { x: -100, y: -400, scale: 0.22, opacity: 0.8 }, // Moved well above text
        { x: 100, y: -150, scale: 0.18, opacity: 0.6 }, // Moved above text
        { x: 300, y: -180, scale: 0.14, opacity: 0.4 }, // Moved above text
        
        // Middle right - moved to lower right to avoid text
        { x: 600, y: 380, scale: 0.16, opacity: 0.4 },
        { x: 800, y: 450, scale: 0.19, opacity: 0.6 },
        
        // Far right (off-screen)
        { x: 300, y: 200, scale: 0.12, opacity: 0.2 },
        
        // Lower left
        { x: -700, y: 380, scale: 0.13, opacity: 0.2 },
        { x: -400, y: 420, scale: 0.17, opacity: 0.6 },
        
        // Lower center - moved up to avoid input field
        { x: -150, y: -900, scale: 0.15, opacity: 0.4 },
        { x: 800, y: -250, scale: 0.18, opacity: 0.6 },
        
        // Lower right and far off-screen
        { x: 500, y: 20, scale: 0.11, opacity: 0.2 },
        { x: 300, y: 60, scale: 0.09, opacity: 0.2 },
        { x: 400, y: 100, scale: 0.14, opacity: 0.4 },
      ]

      // Sort positions by x coordinate (left to right) so rightmost stays rightmost
      scatteredPositions.sort((a, b) => a.x - b.x)

      // Calculate final grid positions (25 images in a single row with proper spacing)
      const cardWidth = 240
      const gap = 32 // Increased gap to ensure images don't touch
      const totalWidth = (cardWidth * 25) + (gap * 24)
      const startX = -totalWidth / 2 + cardWidth / 2

      // Get the actual position of the trades section
      const tradesSection = tradesSectionRef.current
      if (!tradesSection) return

      const sectionTop = tradesSection.offsetTop
      const heroHeight = window.innerHeight // Hero is min-h-screen
      const finalY = sectionTop - heroHeight / 2 + 300 // Position relative to initial center (increased to 300)

      // Set initial scattered state (in hero section) - pure 2D
      tradeImageRefs.current.forEach((ref, index) => {
        if (ref && index < 25) {
          const pos = scatteredPositions[index]
          gsap.set(ref, {
            x: pos.x,
            y: pos.y,
            scale: pos.scale,
            opacity: pos.opacity,
            force3D: false, // Disable 3D transforms
          })
        }
      })

      // Variable to store infinite scroll animations
      let scrollAnimations: gsap.core.Tween[] = []

      // Create scroll-triggered animation timeline for organizing cards
      const organizeTl = gsap.timeline({
        scrollTrigger: {
          trigger: "body",
          start: "top top", // Start immediately when page scroll begins
          end: () => {
            const sectionTop = tradesSectionRef.current?.offsetTop || 1000
            const viewportHeight = window.innerHeight
            // Complete animation before section comes into view
            // Images will be in position and scrolling before user reaches the section
            return `+=${sectionTop - viewportHeight * 0.1}`
          },
          scrub: 1, // Smooth scrubbing
          markers: false,
          onUpdate: (self) => {
            // Start infinite scroll when animation is complete (progress = 1)
            if (self.progress === 1 && scrollAnimations.length === 0) {
              tradeImageRefs.current.forEach((ref) => {
                if (ref) {
                  const anim = gsap.to(ref, {
                    x: "-=2000",
                    duration: 60,
                    ease: "none",
                    repeat: -1,
                    repeatDelay: 0,
                    force3D: false,
                  })
                  scrollAnimations.push(anim)
                }
              })
            }
            // Stop infinite scroll when scrolling back before completion
            if (self.progress < 1 && scrollAnimations.length > 0) {
              scrollAnimations.forEach(anim => anim.kill())
              scrollAnimations = []
            }
          },
        }
      })

      // Animate each image to its final grid position in second section - pure 2D, smoother
      tradeImageRefs.current.forEach((ref, index) => {
        if (ref && index < 25) {
          const finalX = startX + (index * (cardWidth + gap))
          
          organizeTl.to(ref, {
            x: finalX,
            y: finalY, // Position dynamically calculated based on section position
            scale: 1,
            opacity: 1,
            ease: "power2.out", // Smoother easing
            duration: 2, // Longer duration for smoother animation
            force3D: false, // Disable 3D transforms
          }, index * 0.015) // Reduced stagger for smoother flow
        }
      })

      return () => {
        organizeTl.kill()
      }
    })

    return () => {
      mm.kill()
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill())
    }
  }, [])

  // Track when user scrolls past hero input
  useEffect(() => {
    const heroInput = heroInputRef.current
    if (!heroInput) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        // Show nav input when hero input is out of view
        setShowNavInput(!entry.isIntersecting)
      },
      { threshold: 0 }
    )

    observer.observe(heroInput)

    return () => {
      observer.disconnect()
    }
  }, [])

  useEffect(() => {
    const observers = cardRefs.current.map((ref, index) => {
      if (!ref) return null

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setVisibleCards((prev) => {
                const newState = [...prev]
                newState[index] = true
                return newState
              })
              observer.unobserve(ref)
            }
          })
        },
        { threshold: 0.1, rootMargin: '50px' }
      )

      observer.observe(ref)
      return observer
    })

    return () => {
      observers.forEach((observer, index) => {
        if (observer && cardRefs.current[index]) {
          observer.unobserve(cardRefs.current[index]!)
        }
      })
    }
  }, [])

  // Show cards when section is visible
  useEffect(() => {
    if (isSection2Visible) {
      setVisibleCards([true, true, true, true])
    }
  }, [isSection2Visible])

  useEffect(() => {
    if (!section2Ref.current) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsSection2Visible(true)
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.3 }
    )

    observer.observe(section2Ref.current)

    return () => {
      if (section2Ref.current) {
        observer.unobserve(section2Ref.current)
      }
    }
  }, [])

  useEffect(() => {
    const calculateLineCoords = () => {
      if (!applyRef.current || !earningRef.current || !processContainerRef.current) return

      const applyRect = applyRef.current.getBoundingClientRect()
      const earningRect = earningRef.current.getBoundingClientRect()
      const containerRect = processContainerRef.current.getBoundingClientRect()

      const x1 = applyRect.right - containerRect.left
      const x2 = earningRect.left - containerRect.left
      const y = applyRect.top + applyRect.height / 2 - containerRect.top
      const length = x2 - x1

      if (x1 > 0 && x2 > x1 && y > 0) {
        setLineCoords({ x1, x2, y, length })
      }
    }

    // Calculate after a small delay to ensure buttons are rendered
    const timeoutId = setTimeout(() => {
      calculateLineCoords()
    }, 100)

    // Also calculate on next frame
    requestAnimationFrame(() => {
      calculateLineCoords()
    })

    window.addEventListener('resize', calculateLineCoords)
    return () => {
      clearTimeout(timeoutId)
      window.removeEventListener('resize', calculateLineCoords)
    }
  }, [])

  useEffect(() => {
    // Scroll to second testimonial on mount
    if (testimonialContainerRef.current && testimonialRefs.current[1]) {
      const timeoutId = setTimeout(() => {
        const container = testimonialContainerRef.current
        const secondTestimonial = testimonialRefs.current[1]
        if (container && secondTestimonial) {
          const containerRect = container.getBoundingClientRect()
          const itemRect = secondTestimonial.getBoundingClientRect()
          const scrollLeft = secondTestimonial.offsetLeft - (containerRect.width / 2) + (itemRect.width / 2)
          container.scrollTo({ left: scrollLeft, behavior: 'smooth' })
        }
      }, 100)
      return () => clearTimeout(timeoutId)
    }
  }, [])

  useEffect(() => {
    if (!testimonialContainerRef.current) return

    const checkCentered = () => {
      if (!testimonialContainerRef.current) return
      
      const container = testimonialContainerRef.current
      const containerRect = container.getBoundingClientRect()
      const containerCenter = containerRect.left + containerRect.width / 2

      testimonialRefs.current.forEach((ref, index) => {
        if (!ref) return
        
        const rect = ref.getBoundingClientRect()
        const itemCenter = rect.left + rect.width / 2
        const distance = Math.abs(containerCenter - itemCenter)
        
        // If the testimonial is within 150px of center, consider it centered
        if (distance < 150) {
          setCenteredTestimonial(index)
        }
      })
    }

    // Check on scroll
    const container = testimonialContainerRef.current
    container.addEventListener('scroll', checkCentered)
    
    // Initial check
    checkCentered()

    // Also use IntersectionObserver as backup
    const observers = testimonialRefs.current.map((ref) => {
      if (!ref) return null

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              checkCentered()
            }
          })
        },
        {
          root: testimonialContainerRef.current,
          threshold: [0, 0.5, 1],
          rootMargin: '0px'
        }
      )

      observer.observe(ref)
      return observer
    })

    return () => {
      container.removeEventListener('scroll', checkCentered)
      observers.forEach((observer) => {
        if (observer) {
          observer.disconnect()
        }
      })
    }
  }, [])

  return (
    <div className="min-h-screen bg-[#faf9f5] relative overflow-hidden">
      {/* Navbar */}
      <Navbar showInput={showNavInput} />
      
      {/* Scattered contractor images that will transform into cards - at root level to traverse sections */}
      <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 5 }}>
        {[...Array(25)].map((_, index) => {
          const contractorImages = [
            '/contractors/22bd86e4bfc5e1aaaf264e774c349dff.jpg',
            '/contractors/56fe20dc1463de687448f7b05c5b9504.jpg',
            '/contractors/8abdf0e7b39201eab5992d6557bc1f0e.jpg',
            '/contractors/aa9c5fdbb24369cae69be61a261a1671.jpg',
            '/contractors/dc7ff51544b30db18f55c8ea63e635c0.jpg',
            '/contractors/dd745b0b0d6b5b434a383352f9cdc035.jpg',
            '/contractors/f36a8260df200c4b9da22216617ee32c.jpg',
          ]
          const tradeNames = [
            'Handyman',
            'Plumber',
            'Technician',
            'Electrician',
            'Painter',
            'Carpenter',
            'Roofer',
          ]
          
          return (
            <div
              key={index}
              ref={(el) => { tradeImageRefs.current[index] = el }}
              className="absolute"
              style={{ 
                transformOrigin: 'center center',
                left: '50%',
                top: '50vh', // Start at 50% of viewport height (hero section center)
                width: '240px',
              }}
            >
              <div className="overflow-hidden rounded-xl w-full">
                <img 
                  src={contractorImages[index % contractorImages.length]} 
                  alt={tradeNames[index % tradeNames.length]}
                  className="w-full h-auto object-contain block"
                  draggable="false"
                  style={{ display: 'block' }}
                />
              </div>
            </div>
          )
        })}
      </div>

      {/* Hero section with scattered images in background */}
      <div className="relative min-h-screen">
        {/* Hero content */}
        <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-8">
          <SectionHeader
          isHero={true}
            title="Join the network that puts pros first"
            description="Quality leads. Fast payments. Zero bidding."
          />
          <div ref={heroInputRef} className="mt-8 w-full max-w-md">
            <InputWithButton
              placeholder="Enter your email"
              buttonText="Get started"
              buttonVariant="default"
              buttonSize="lg"
              buttonProps={{ className: "text-white" }}
            />
          </div>
        </div>
      </div>

      {/* For all trades section - where images land and scroll */}
      <div className="relative min-h-screen pt-20 pb-20 px-8" ref={tradesSectionRef}>
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col items-center mb-16 relative z-10">
            <SectionHeader
              subtitle="Jack"
              title="For all trades"
              description="Jack has more than 100 thousand jobs available across 1000+ trades"
              link="Get started"
              linkHref="#"
              buttonVariant="default"
              buttonSize="default"
            />
          </div>
          {/* Container for cards that will scroll infinitely - positioned right after header */}
          <div className="relative h-[350px] w-full">
            {/* Images will land here and scroll horizontally */}
          </div>
        </div>
      </div>
      <div className="relative z-10 pt-20 pb-20 px-8" ref={(el) => { section2Ref.current = el }}>
        <div className="max-w-7xl mx-auto flex flex-col items-center">
          <div 
            className="bg-white rounded-2xl p-12 w-full"
          >
            <SectionHeader
              subtitle="Why Jack?"
              title="Earn more. Faster"
              description="We handle the marketing, scheduling, and payments—so you can focus on what you do best."
            />
            <div className="mt-6 w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card
                ref={(el) => { cardRefs.current[0] = el }}
                className={`transition-all duration-500 ease-out transform ${
                  visibleCards[0]
                    ? 'opacity-100 translate-y-0'
                    : 'opacity-0 translate-y-2'
                }`}
                style={{
                  transitionDelay: visibleCards[0] ? '0ms' : '0ms',
                }}
              >
                <CardHeader>
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="mb-2 text-brand transition-transform duration-300 hover:scale-110">
                    <path d="M12 2V22M17 5H9.5C8.57174 5 7.6815 5.36875 7.02513 6.02513C6.36875 6.6815 6 7.57174 6 8.5C6 9.42826 6.36875 10.3185 7.02513 10.9749C7.6815 11.6312 8.57174 12 9.5 12H14.5C15.4283 12 16.3185 12.3687 16.9749 13.0251C17.6312 13.6815 18 14.5717 18 15.5C18 16.4283 17.6312 17.3185 16.9749 17.9749C16.3185 18.6312 15.4283 19 14.5 19H6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <CardTitle>Top-Tier Earnings</CardTitle>
                  <CardDescription>Competitive rates with transparent pricing. No hidden fees or surprise deductions.</CardDescription>
                </CardHeader>
              </Card>
              <Card
                ref={(el) => { cardRefs.current[1] = el }}
                className={`transition-all duration-500 ease-out transform ${
                  visibleCards[1]
                    ? 'opacity-100 translate-y-0'
                    : 'opacity-0 translate-y-2'
                }`}
                style={{
                  transitionDelay: visibleCards[1] ? '150ms' : '0ms',
                }}
              >
                <CardHeader>
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="mb-2 text-brand transition-transform duration-300 hover:scale-110">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5"/>
                    <path d="M12 6V12L16 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <CardTitle>24-Hour Payments</CardTitle>
                  <CardDescription>Get paid within a day of job completion. Direct deposit to your bank.</CardDescription>
                </CardHeader>
              </Card>
              <Card
                ref={(el) => { cardRefs.current[2] = el }}
                className={`transition-all duration-500 ease-out transform ${
                  visibleCards[2]
                    ? 'opacity-100 translate-y-0'
                    : 'opacity-0 translate-y-2'
                }`}
                style={{
                  transitionDelay: visibleCards[2] ? '300ms' : '0ms',
                }}
              >
                <CardHeader>
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="mb-2 text-brand transition-transform duration-300 hover:scale-110">
                    <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.5"/>
                    <path d="M16 2V6M8 2V6M3 10H21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                  <CardTitle>Flexible Schedule</CardTitle>
                  <CardDescription>Work when you want. Set your own availability and accept jobs that fit.</CardDescription>
                </CardHeader>
              </Card>
              <Card
                ref={(el) => { cardRefs.current[3] = el }}
                className={`transition-all duration-500 ease-out transform ${
                  visibleCards[3]
                    ? 'opacity-100 translate-y-0'
                    : 'opacity-0 translate-y-2'
                }`}
                style={{
                  transitionDelay: visibleCards[3] ? '450ms' : '0ms',
                }}
              >
                <CardHeader>
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="mb-2 text-brand transition-transform duration-300 hover:scale-110">
                    <path d="M12 22C12 22 20 16 20 10V5L12 2L4 5V10C4 16 12 22 12 22Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <CardTitle>$2M Insurance</CardTitle>
                  <CardDescription>Every job backed by comprehensive liability coverage. Work with confidence.x</CardDescription>
                </CardHeader>
              </Card>
            </div>
          </div>
        </div>
      </div>
      <div className="relative z-10 pt-20 pb-20 px-8">
        <div className="max-w-5xl mx-auto flex flex-col items-center">
          <SectionHeader
            subtitle="Process"
            title="Get hired in 48 hours"
            description="From application to your first job in as little as 48 hours."
          />
          <div className="mt-8 relative" ref={processContainerRef}>
            {lineCoords.x1 > 0 && lineCoords.x2 > lineCoords.x1 && (
              <svg className="absolute inset-0 w-full h-full pointer-events-none z-0" style={{ overflow: 'visible' }}>
                <line
                  x1={lineCoords.x1}
                  y1={lineCoords.y}
                  x2={lineCoords.x2}
                  y2={lineCoords.y}
                  stroke="#E5E7EB"
                  strokeWidth="1"
                  strokeLinecap="round"
                  strokeDasharray={lineCoords.length}
                  strokeDashoffset={lineCoords.length}
                  style={{
                    animation: 'drawLine 1.5s ease-out forwards',
                  }}
                />
                <style>{`
                  @keyframes drawLine {
                    to {
                      stroke-dashoffset: 0;
                    }
                  }
                `}</style>
              </svg>
            )}
            <div className="grid grid-cols-3 gap-8 relative z-10" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
              <div className="flex flex-col items-center">
                <Button ref={applyRef} variant="default" size="default" className="relative z-10 text-white">Apply</Button>
                <p className="mt-3 text-sm text-gray-600 text-center">Tell us about your skills, experience, and the services you offer. Takes about 10 minutes.</p>
              </div>
              <div className="flex flex-col items-center">
                <Button ref={approvedRef} variant="outline" size="default" className="relative z-10">Get Approved</Button>
                <p className="mt-3 text-sm text-gray-600 text-center">We review applications within 48 hours. Background check and verification included.</p>
              </div>
              <div className="flex flex-col items-center">
                <Button ref={earningRef} variant="outline" size="default" className="relative z-10">Start Earning</Button>
                <p className="mt-3 text-sm text-gray-600 text-center">Get matched with homeowners in your area. Accept jobs via text and start earning.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="relative z-10 pt-20 pb-20">
        <div className="w-full flex flex-col items-center">
          <div className="max-w-7xl mx-auto px-8 w-full">
            <SectionHeader
              subtitle="Our Customers"
              title="Don't just take our word for it"
            />
          </div>
          <div 
            ref={testimonialContainerRef}
            className="mt-12 w-full overflow-x-auto snap-x snap-mandatory" 
            style={{ 
              scrollbarWidth: 'none', 
              msOverflowStyle: 'none', 
              WebkitOverflowScrolling: 'touch',
              scrollSnapType: 'x mandatory'
            }}
          >
            <style>{`
              div::-webkit-scrollbar {
                display: none;
              }
            `}</style>
            <div className="flex gap-8">
              <div className="flex-shrink-0" style={{ width: 'calc(50% - 325px)' }}></div>
              <div 
                ref={(el) => { testimonialRefs.current[0] = el }}
                className="w-[700px] flex-shrink-0 snap-center transition-opacity duration-300"
                style={{ opacity: centeredTestimonial === 0 ? 1 : 0.5 }}
              >
                <Testimonial
                  video=""
                  image="/testimonials/testimonial-1.jpg"
                  quote="Jack has completely transformed how I run my business. The quality of leads is unmatched."
                  author="Sarah Johnson"
                  title="General Contractor"
                />
              </div>
              <div 
                ref={(el) => { testimonialRefs.current[1] = el }}
                className="w-[700px] flex-shrink-0 snap-center transition-opacity duration-300"
                style={{ opacity: centeredTestimonial === 1 ? 1 : 0.5 }}
              >
                <Testimonial
                  video=""
                  image="/testimonials/testimonial-2.jpg"
                  quote="I've tried other platforms, but nothing comes close to the support and opportunities Jack provides."
                  author="Mike Chen"
                  title="Electrician"
                />
              </div>
              <div 
                ref={(el) => { testimonialRefs.current[2] = el }}
                className="w-[700px] flex-shrink-0 snap-center transition-opacity duration-300"
                style={{ opacity: centeredTestimonial === 2 ? 1 : 0.5 }}
              >
                <Testimonial
                  video=""
                  image="/testimonials/testimonial-3.jpg"
                  quote="The best decision I made was joining Jack. My income has doubled in just 6 months."
                  author="David Martinez"
                  title="Plumber"
                />
              </div>
              <div className="flex-shrink-0" style={{ width: 'calc(50% - 325px)' }}></div>
            </div>
          </div>
        </div>
      </div>
      <div className="relative z-10 pt-20 pb-20 px-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-2xl p-12 w-full">
            <div className="flex flex-col items-center">
              <SectionHeader
                title="All you need"
                description="We partner with licensed, insured professionals who deliver quality work."
                maxWidth="full"
              />
              <div className="mt-8 border border-none rounded-lg p-6">
                <div className="grid grid-cols-3 gap-6">
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2 mb-1">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-brand flex-shrink-0">
                        <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      <p className="font-semibold">Licence</p>
                    </div>
                    <p className="text-sm text-muted-foreground">Valid contractor license (if required for your trade)</p>
                  </div>
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2 mb-1">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-brand flex-shrink-0">
                        <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      <p className="font-semibold">Insurance</p>
                    </div>
                    <p className="text-sm text-muted-foreground">Liability insurance ($1M minimum coverage)</p>
                  </div>
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2 mb-1">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-brand flex-shrink-0">
                        <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      <p className="font-semibold">Transport</p>
                    </div>
                    <p className="text-sm text-muted-foreground">Reliable transportation to job sites</p>
                  </div>
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2 mb-1">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-brand flex-shrink-0">
                        <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      <p className="font-semibold">Phone</p>
                    </div>
                    <p className="text-sm text-muted-foreground">Smartphone with texting capability</p>
                  </div>
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2 mb-1">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-brand flex-shrink-0">
                        <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      <p className="font-semibold">Check</p>
                    </div>
                    <p className="text-sm text-muted-foreground">Pass background check</p>
                  </div>
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2 mb-1">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-brand flex-shrink-0">
                        <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      <p className="font-semibold">Experience</p>
                    </div>
                    <p className="text-sm text-muted-foreground">At least 2 years of professional experience</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Final CTA section */}
      <div className="relative z-10 pt-20 pb-20 px-8">
        <div className="max-w-7xl mx-auto flex flex-col items-center">
          <SectionHeader
            title="Ready?"
            description="Join thousands of professionals earning more with less hassle. Apply now and start receiving quality leads within days."
          />
          <div className="mt-8 w-full max-w-md">
            <InputWithButton
              placeholder="Enter your email"
              buttonText="Get started"
              buttonVariant="default"
              buttonSize="lg"
              buttonProps={{ className: "text-white" }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
