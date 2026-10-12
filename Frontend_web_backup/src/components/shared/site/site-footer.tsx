import { Link } from 'react-router-dom'
import { BookOpen } from 'lucide-react'
import Container from './container'

export default function SiteFooter() {
  return (
    <footer className="bg-background dark:bg-background pt-24 pb-12 transition-colors duration-500 border-t border-black/5 dark:border-white/5">
      <Container>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-8 mb-20">
          {/* Brand Section */}
          <div className="lg:col-span-4 space-y-8">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center transition-transform group-hover:scale-105">
                <BookOpen className="h-6 w-6 text-white dark:text-background" />
              </div>
              <span className="font-bold text-2xl tracking-tight text-primary">Storya</span>
            </Link>
            <p className="text-base text-muted-foreground leading-relaxed font-medium max-w-sm">
              Nơi những câu chuyện Indie tìm thấy ánh sáng. Trải nghiệm đọc Light Novel tinh tế, đa nền tảng và tràn đầy cảm hứng.
            </p>
            <div className="flex items-center gap-3">
              {['FB', 'IG', 'X', 'YT'].map((social) => (
                <a
                  key={social}
                  href="#"
                  className="w-10 h-10 rounded-full border border-border/50 dark:border-white/10 flex items-center justify-center text-xs font-bold text-muted-foreground hover:border-primary hover:text-primary transition-all"
                >
                  {social}
                </a>
              ))}
            </div>
          </div>

          {/* Links Sections */}
          <div className="lg:col-span-8 grid grid-cols-2 sm:grid-cols-4 gap-12 lg:gap-4">
            <FooterColumn
              title="Khám phá"
              links={[
                { label: 'Trang chủ', to: '/' },
                { label: 'Thể loại', to: '/discover' },
                { label: 'Mới nhất', to: '/latest' },
                { label: 'Bảng xếp hạng', to: '/ranking' },
              ]}
            />
            <FooterColumn
              title="Sáng tác"
              links={[
                { label: 'Viết truyện', to: '/write' },
                { label: 'Hướng dẫn', to: '/guide' },
                { label: 'Cộng đồng', to: '/community' },
              ]}
            />
            <FooterColumn
              title="Công ty"
              links={[
                { label: 'Về chúng tôi', to: '/about' },
                { label: 'Tuyển dụng', to: '/careers' },
                { label: 'Liên hệ', to: '/contact' },
              ]}
            />
            <FooterColumn
              title="Hỗ trợ"
              links={[
                { label: 'Trợ giúp', to: '/faq' },
                { label: 'Bảo mật', to: '/privacy' },
                { label: 'Điều khoản', to: '/terms' },
              ]}
            />
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-border/50 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex flex-col md:flex-row items-center gap-4 md:gap-8">
            <p className="text-sm font-medium text-muted-foreground">
              © {new Date().getFullYear()} Storya Inc.
            </p>
            <div className="flex items-center gap-6 text-sm font-medium text-muted-foreground/60">
              <Link to="/terms" className="hover:text-foreground transition-colors">Điều khoản</Link>
              <Link to="/privacy" className="hover:text-foreground transition-colors">Bảo mật</Link>
              <Link to="/cookies" className="hover:text-foreground transition-colors">Cookies</Link>
            </div>
          </div>

          <div className="flex items-center gap-3 text-[11px] font-bold uppercase tracking-wider text-muted-foreground/80 bg-muted px-4 py-1.5 rounded-full border border-border/50">
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
            System Operational
            <span className="mx-2 opacity-20">|</span>
            VN
          </div>
        </div>
      </Container>
    </footer>
  )
}

function FooterColumn({ title, links }: { title: string; links: { label: string; to: string }[] }) {
  return (
    <div className="space-y-6">
      <h4 className="text-[11px] font-bold uppercase tracking-[0.2em] text-foreground/40">{title}</h4>
      <ul className="space-y-4">
        {links.map((link) => (
          <li key={link.label}>
            <Link to={link.to} className="text-[14px] font-medium text-muted-foreground hover:text-primary transition-colors">
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
