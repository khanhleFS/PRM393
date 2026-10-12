import React from 'react';
import Container from "../shared/site/container";
import { ArrowRight, PenTool } from "lucide-react";
import authorImg from "../../assets/Gemini_Generated_Image_r1zamzr1zamzr1za.png";
import SplitText from "@/components/custom/split-text/SplitText";


const AuthorCTA: React.FC = () => {
  return (
    <section className="py-24 relative overflow-hidden bg-background">

      <Container>
        <div className="relative z-10 bg-white dark:bg-black border border-outline/10 rounded-[48px] overflow-hidden shadow-2xl flex flex-col lg:flex-row items-center gap-12">

          {/* Content Side */}
          <div className="flex-1 p-8 md:p-16 lg:p-20 space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-xs font-bold uppercase tracking-widest text-primary">
              <PenTool className="w-4 h-4" />
              Dành cho tác giả
            </div>

            <div className="space-y-4">
              <SplitText
                tag="h2"
                className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold tracking-tight text-foreground leading-[1.1] pb-2 overflow-visible"
                delay={10}
                duration={1.2}
                splitType="words"
                textAlign="left"
              >
                Biến câu chuyện của bạn thành <br />
                <span className="text-gradient-animated">tinh hoa</span>
              </SplitText>
              <SplitText
                className="text-lg md:text-xl text-muted-foreground max-w-xl leading-relaxed"
                delay={30}
                duration={1}
                splitType="lines"
                textAlign="left"
              >
                Gia nhập cộng đồng hơn 10.000 tác giả Indie tại Storya. Chúng tôi cung cấp mọi công cụ bạn cần để sáng tác, xuất bản và tiếp cận hàng triệu độc giả.
              </SplitText>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-6">
              <button className="btn-primary flex items-center justify-center gap-2 group h-14 px-8 text-lg">
                Bắt đầu sáng tác ngay
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

          {/* Image Side */}
          <div className="flex-1 w-full lg:w-1/2 h-full min-h-[400px] lg:min-h-[600px] relative">
            <img
              src={authorImg}
              alt="Author Illustration"
              className="absolute inset-0 w-full h-full object-cover object-center"
            />
          </div>

        </div>
      </Container>
    </section>
  );
};

export default AuthorCTA;
