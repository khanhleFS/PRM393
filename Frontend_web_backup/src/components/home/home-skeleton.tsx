import Container from "@/components/shared/site/container"
import { Skeleton } from "@/components/ui/skeleton"

const HeroSkeleton = () => (
    <section className="relative pt-12 md:pt-16 pb-16 md:pb-24 overflow-hidden">
        <Container className="text-center space-y-4 md:space-y-6 relative z-30">
            <div className="flex justify-center">
                <Skeleton className="h-[28px] w-36 rounded-full" />
            </div>
            <div className="space-y-3 max-w-5xl mx-auto flex flex-col items-center">
                <Skeleton className="h-10 sm:h-12 md:h-16 lg:h-20 w-[80%] max-w-3xl rounded-xl" />
                <Skeleton className="h-10 sm:h-12 md:h-16 lg:h-20 w-[60%] max-w-xl rounded-xl" />
            </div>
            <div className="max-w-xl mx-auto pt-2">
                <Skeleton className="h-5 w-[85%] max-w-md rounded-md mx-auto" />
            </div>
            <div className="flex items-center justify-center gap-4 pt-4">
                <Skeleton className="h-[46px] w-[130px] rounded-full" />
                <Skeleton className="h-[46px] w-[110px] rounded-full" />
            </div>
        </Container>
    </section>
)

const TrendingGallerySkeleton = () => (
    <section className="mb-20 md:mb-32 relative z-10 -mt-16 md:-mt-50">
        <div className="h-[300px] sm:h-[450px] md:h-[650px] w-full flex items-center justify-center gap-6 overflow-hidden px-4">
            <Skeleton className="hidden md:block w-[180px] h-[240px] md:w-[220px] md:h-[300px] rounded-2xl opacity-40 transform -rotate-12 translate-y-8" />
            <Skeleton className="hidden sm:block w-[200px] h-[270px] md:w-[260px] md:h-[360px] rounded-2xl opacity-75 transform -rotate-6 translate-y-4" />
            <Skeleton className="w-[240px] h-[320px] md:w-[320px] md:h-[440px] rounded-2xl opacity-100 shadow-2xl shadow-primary/10" />
            <Skeleton className="hidden sm:block w-[200px] h-[270px] md:w-[260px] md:h-[360px] rounded-2xl opacity-75 transform rotate-6 translate-y-4" />
            <Skeleton className="hidden md:block w-[180px] h-[240px] md:w-[220px] md:h-[300px] rounded-2xl opacity-40 transform rotate-12 translate-y-8" />
        </div>
        <Container className="mt-12 md:mt-16 text-center">
            <Skeleton className="h-4 w-32 rounded mx-auto" />
        </Container>
    </section>
)

const FeaturesSkeleton = () => (
    <section className="py-20 md:py-32 relative overflow-hidden bg-background">
        <Container>
            <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
                <div className="flex-1 space-y-8 w-full">
                    <div className="space-y-4">
                        <Skeleton className="h-4 w-36 rounded-full" />
                        <Skeleton className="h-10 md:h-14 w-3/4 rounded-xl" />
                        <Skeleton className="h-6 w-full rounded-md" />
                        <Skeleton className="h-6 w-2/3 rounded-md" />
                    </div>

                    <div className="grid sm:grid-cols-2 gap-6 pt-4">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="p-6 rounded-3xl border border-black/5 dark:border-white/5 space-y-4">
                                <Skeleton className="w-10 h-10 rounded-xl" />
                                <Skeleton className="h-6 w-1/2 rounded" />
                                <Skeleton className="h-4 w-full rounded" />
                                <Skeleton className="h-4 w-2/3 rounded" />
                            </div>
                        ))}
                    </div>

                    <div className="pt-6">
                        <Skeleton className="h-14 w-44 rounded-full" />
                    </div>
                </div>

                <div className="flex-1 flex justify-center w-full">
                    <div className="w-[320px] h-[640px] rounded-[60px] border-8 border-foreground/10 p-3 bg-card/50 flex flex-col justify-between">
                        <div className="w-full flex justify-between px-4 py-2">
                            <Skeleton className="w-10 h-3 rounded" />
                            <Skeleton className="w-6 h-3 rounded" />
                        </div>
                        <div className="flex-1 px-4 py-8 space-y-6">
                            <Skeleton className="h-8 w-3/4 rounded-md" />
                            <Skeleton className="h-4 w-full rounded-sm" />
                            <Skeleton className="h-4 w-full rounded-sm" />
                            <Skeleton className="h-4 w-[90%] rounded-sm" />
                            <Skeleton className="h-4 w-[95%] rounded-sm" />
                            <Skeleton className="h-4 w-[50%] rounded-sm" />
                        </div>
                        <div className="h-8 w-full flex justify-center pb-2">
                            <Skeleton className="w-1/3 h-2.5 rounded-full" />
                        </div>
                    </div>
                </div>
            </div>
        </Container>
    </section>
)

const LatestUpdatesSkeleton = () => (
    <section className="py-12 md:py-20 bg-lumina-surface">
        <Container>
            <div className="flex items-center justify-between mb-8 md:mb-12">
                <div className="space-y-2">
                    <Skeleton className="h-8 md:h-10 w-48 rounded-lg" />
                    <Skeleton className="h-1.5 w-20 rounded-full" />
                </div>
                <Skeleton className="h-5 w-24 rounded" />
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="space-y-4">
                        <Skeleton className="aspect-[3/4] w-full rounded-xl md:rounded-[32px]" />
                        <div className="space-y-2 flex flex-col items-center">
                            <Skeleton className="h-6 w-3/4 rounded" />
                            <Skeleton className="h-4 w-1/2 rounded" />
                        </div>
                    </div>
                ))}
            </div>
        </Container>
    </section>
)

const AuthorCTASkeleton = () => (
    <section className="py-24 bg-background">
        <Container>
            <div className="relative bg-card border border-black/5 dark:border-white/5 rounded-[48px] overflow-hidden flex flex-col lg:flex-row items-center gap-12">
                <div className="flex-1 p-8 md:p-16 lg:p-20 space-y-8 w-full">
                    <Skeleton className="h-8 w-44 rounded-full" />
                    <div className="space-y-4">
                        <Skeleton className="h-10 md:h-14 w-full rounded-xl" />
                        <Skeleton className="h-10 md:h-14 w-2/3 rounded-xl" />
                        <Skeleton className="h-6 w-full rounded-md" />
                        <Skeleton className="h-6 w-5/6 rounded-md" />
                    </div>
                    <div className="pt-6">
                        <Skeleton className="h-14 w-56 rounded-full" />
                    </div>
                </div>

                <div className="flex-1 w-full lg:w-1/2 h-[300px] lg:h-[600px]">
                    <Skeleton className="w-full h-full" />
                </div>
            </div>
        </Container>
    </section>
)

export function HomePageSkeleton() {
    return (
        <div className="bg-gradient-to-b from-background via-lumina-dim/50 to-background">
            <HeroSkeleton />
            <TrendingGallerySkeleton />
            <FeaturesSkeleton />
            <LatestUpdatesSkeleton />
            <AuthorCTASkeleton />
        </div>
    )
}