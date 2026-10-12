import { Sparkles, Smartphone, Users, Moon, ChevronDown, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import Container from "@/components/shared/site/container"
import SplitText from "@/components/custom/split-text/SplitText"


const features = [
  {
    icon: <Sparkles className="h-6 w-6" />,
    title: 'Trải nghiệm Premiere',
    description: 'Giao diện đọc tinh tế, mượt mà với hệ thống Lumina Scroll độc bản.'
  },
  {
    icon: <Smartphone className="h-6 w-6" />,
    title: 'Đa nền tảng',
    description: 'Đọc mọi lúc mọi nơi. Đồng bộ tiến trình đọc trên tất cả thiết bị của bạn.'
  },
  {
    icon: <Users className="h-6 w-6" />,
    title: 'Cộng đồng Indie',
    description: 'Không gian sáng tạo tự do cho các tác giả và độc giả đam mê truyện chữ.'
  },
  {
    icon: <Moon className="h-6 w-6" />,
    title: 'Chế độ tối ưu',
    description: 'Tùy chỉnh font chữ, màu nền và chế độ đọc đêm để bảo vệ thị giác.'
  }
]

const MockupContent = ({ isDark }: { isDark: boolean }) => {
  const textColor = isDark ? 'text-white' : 'text-[#0F0D13]';
  const borderColor = isDark ? 'border-white/10' : 'border-black/10';
  const iconBg = isDark ? 'bg-white/20' : 'bg-black/10';
  const barBg = isDark ? 'bg-white/20' : 'bg-black/10';
  const barProgressBg = isDark ? 'bg-white' : 'bg-[#0F0D13]';

  return (
    <>
      {/* Status Bar */}
      <div className="h-10 w-full flex items-center justify-between px-8 pt-4">
        <span className={`text-[10px] font-bold font-sans ${textColor}`}>9:41</span>
        <div className="flex gap-1.5 items-center">
          <div className={`w-4 h-2 rounded-sm border relative ${isDark ? 'border-white/40' : 'border-black/40'}`}>
            <div className={`absolute inset-y-[1px] left-[0.5px] w-2 rounded-sm ${isDark ? 'bg-white' : 'bg-[#0F0D13]'}`} />
          </div>
        </div>
      </div>

      {/* Header */}
      <div className={`px-6 py-4 flex items-center justify-between border-b mt-2 ${borderColor}`}>
        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${iconBg}`}>
          <ChevronDown className={`h-4 w-4 rotate-90 ${textColor}`} />
        </div>
        <span className={`text-[10px] uppercase tracking-widest font-bold font-sans ${textColor}`}>Chương 12</span>
        <div className="w-8 h-8" />
      </div>

      {/* Reading Content */}
      <div className={`flex-1 px-8 py-10 space-y-6 font-serif ${textColor}`}>
        <h1 className="text-2xl font-bold leading-tight">Thành Phố Sương Mù</h1>
        <div className="space-y-4">
          <p className="text-[14px] leading-relaxed opacity-90">
            Ánh trăng tan ra trên mặt hồ lặng sóng, phủ lên vạn vật một lớp lụa mỏng màu bạc.
          </p>
          <p className="text-[14px] leading-relaxed opacity-90">
            Kael đứng đó, lắng nghe tiếng thì thầm của gió. Mọi thứ dường như đang chờ đợi...
          </p>
          <p className="text-[14px] leading-relaxed opacity-90">
            Một tiếng rắc khẽ khàng vang lên từ phía bụi rậm. Anh siết chặt chuôi kiếm...
          </p>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="p-8 space-y-4 pb-12">
        <div className="flex justify-between items-center">
          <div className="flex gap-3">
            <div className={`w-8 h-8 rounded-lg border ${isDark ? 'border-white/20' : 'border-black/10'}`} />
            <div className={`w-8 h-8 rounded-lg border ${isDark ? 'bg-white border-white/20' : 'bg-[#0F0D13] border-black/10'}`} />
          </div>
          <div className="flex items-center gap-3">
            <span className={`text-sm font-bold font-sans ${textColor}`}>Aa</span>
            <div className={`w-24 h-1 rounded-full overflow-hidden ${barBg}`}>
              <div className={`w-3/4 h-full ${barProgressBg}`} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default function Features() {
  return (
    <section id="features" className="pb-50 bg-background overflow-hidden relative">
      <Container>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 md:gap-24 items-center">
          {/* Left: Phone Mockup with floating effects */}
          <div className="relative order-2 lg:order-1 flex justify-center items-center">
            <div className="relative w-fit">
              {/* Mockup Phone Frame */}
              <div className="mockup-phone border-primary shadow-2xl w-[320px] md:w-[400px]">
                <div className="mockup-phone-camera"></div>
                <div className="mockup-phone-display">
                  <div className="relative w-full h-full overflow-hidden bg-background @container">
                    <div className="diff absolute inset-0 w-full h-full">

                      {/* DARK SIDE (Item 1) */}
                      <div className="diff-item-1">
                        <div className="bg-[#0F0D13] text-white flex flex-col h-full w-[100cqw] pointer-events-none">
                          <MockupContent isDark={true} />
                        </div>
                      </div>

                      {/* LIGHT SIDE (Item 2) */}
                      <div className="diff-item-2">
                        <div className="bg-[#FDF8FD] text-[#0F0D13] flex flex-col h-full w-[100cqw] pointer-events-none">
                          <MockupContent isDark={false} />
                        </div>
                      </div>

                      <div className="diff-resizer z-30"></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating Decorative Elements */}
              <div className="absolute top-24 -right-6 z-20 bg-background/95 backdrop-blur-xl p-3.5 rounded-2xl shadow-xl border border-black/5 dark:border-white/10 animate-bounce duration-[5s]">
                <Sparkles className="h-5 w-5 text-primary" />
              </div>
              <div className="absolute bottom-40 -left-6 z-20 bg-background/95 backdrop-blur-xl p-3.5 rounded-2xl shadow-xl border border-black/5 dark:border-white/10 animate-bounce duration-[4s] delay-700">
                <Moon className="h-5 w-5 text-primary" />
              </div>
            </div>
          </div>

          {/* Right: Content */}
          <div className="space-y-12 order-1 lg:order-2">
            <div className="space-y-6">
              <SplitText
                tag="h2"
                className="text-4xl md:text-6xl font-serif font-bold tracking-tight text-foreground leading-[1.1]"
                delay={10}
                duration={1.2}
                splitType="words"
                textAlign="left"
              >
                Trải nghiệm đọc <br />
                <span className="text-gradient-animated inline-block align-baseline">hoàn hảo</span> nhất.
              </SplitText>
              <SplitText
                className="text-lg text-muted-foreground font-medium max-w-xl leading-relaxed"
                delay={30}
                duration={1}
                splitType="lines"
                textAlign="left"
              >
                Chúng tôi không chỉ xây dựng một ứng dụng, mà là một không gian dành riêng cho những người yêu thích chiều sâu của câu chữ và sự tinh tế trong thiết kế.
              </SplitText>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-12">
              {features.map((feature, idx) => (
                <div key={idx} className="group p-6 -m-6 rounded-2xl hover:bg-primary/5 transition-all duration-500 border border-transparent hover:border-primary/10">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 dark:bg-primary/20 flex items-center justify-center text-primary transition-all duration-500 group-hover:scale-110 group-hover:bg-primary group-hover:text-on-primary shadow-none group-hover:shadow-lg group-hover:shadow-primary/20">
                    {feature.icon}
                  </div>
                  <div className="mt-6 space-y-2">
                    <SplitText
                      tag="h3"
                      className="text-lg font-bold text-foreground group-hover:text-primary transition-colors duration-300"
                      splitType="words"
                      delay={10}
                      duration={0.8}
                      textAlign="left"
                    >
                      {feature.title}
                    </SplitText>
                    <SplitText
                      className="text-sm text-muted-foreground leading-relaxed font-medium transition-colors duration-300"
                      splitType="lines"
                      delay={20}
                      duration={0.8}
                      textAlign="left"
                    >
                      {feature.description}
                    </SplitText>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-6">
              <Link to="/search" className="inline-flex items-center gap-3 bg-foreground text-background px-8 py-4 rounded-full font-bold hover:scale-105 transition-all duration-300 group">
                Khám phá ngay
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </Container>
    </section>
  )
}
