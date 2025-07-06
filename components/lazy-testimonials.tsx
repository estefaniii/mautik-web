"use client"
import dynamic from "next/dynamic"
const Testimonials = dynamic(() => import("@/components/testimonials").then(mod => ({ default: mod.Testimonials })), { ssr: false })
export default Testimonials
