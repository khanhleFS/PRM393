import { Link } from 'react-router-dom'
import { Sparkles } from 'lucide-react'
import Container from "@/components/shared/site/container"
import GradientText from '@/components/custom/gradient-text/GradientText'

export default function Hero() {
  return (
    <section className="relative pt-8 md:pt-16 pb-16 md:pb-24 overflow-hidden">
      <Container className="text-center space-y-4 md:space-y-6 relative z-30">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-[11px] font-bold uppercase tracking-[0.2em] text-primary animate-in fade-in slide-in-from-bottom-4 duration-1000">
          <Sparkles className="h-3.5 w-3.5" />
          Storya Premiere
        </div>

        <div className="space-y-4">
          <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-medium text-foreground max-w-5xl mx-auto leading-[1.4] md:leading-[1.35] italic animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-150">
            "Không chỉ là <GradientText colors={["#5227FF", "#FF9FFC", "#B497CF"]} animationSpeed={8} showBorder={false} className="inline-flex font-bold font-serif italic pb-2">truyện</GradientText>,<br className="hidden md:block" />
            là cả một thế giới."
          </h1>
          <p className="text-sm md:text-lg text-muted-foreground max-w-xl mx-auto font-medium animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-300">
            Khám phá những vũ trụ song song qua từng trang sách tại Storya.
          </p>
        </div>

        <div className="flex items-center justify-center gap-4 animate-in fade-in slide-in-from-bottom-16 duration-1000 delay-500">
          <Link to="/search" className="btn-primary py-2.5">
            Bắt đầu đọc
          </Link>
          <Link to="/search" className="btn-secondary py-2.5">
            Khám phá
          </Link>
        </div>
      </Container>
    </section>
  )
}
