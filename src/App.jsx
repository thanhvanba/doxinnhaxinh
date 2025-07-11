import "./App.css"
import { Header } from "./components/Header"
import { HeroSection } from "./components/HeroSection"
import { FeaturedProducts } from "./components/FeaturedProducts"
import { CategoriesSection } from "./components/CategoriesSection"
import { FlashDealsSection } from "./components/FlashDealsSection"
import { TrustSection } from "./components/TrustSection"
import BrandStory from "./components/BrandStory"
import { NewsletterSection } from "./components/NewsletterSection"
import { Footer } from "./components/Footer"

function App() {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="pt-16">
        <HeroSection />
        <FeaturedProducts />
        <CategoriesSection />
        <FlashDealsSection />
        <TrustSection />
        <BrandStory />
        <NewsletterSection />
      </main>
      <Footer />
    </div>
  )
}

export default App
