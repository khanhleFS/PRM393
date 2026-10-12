import Container from '@/components/shared/site/container'

const featureCards = [
	{
		title: 'Logo, name, and nav',
		description: 'Header content is split into a brand block, a primary navigation section, and icon buttons.',
	},
	{
		title: 'Shared component',
		description: 'The header and footer live in shared components so they can be reused anywhere later.',
	},
	{
		title: 'Standalone preview',
		description: 'This page previews the pieces without wiring them into the main layout shell yet.',
	},
]

export default function DemoPage() {
	return (
		<>
			{/* Hero section */}
			<section>
				<Container>
					<div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
						<div className="space-y-6">
							<p className="text-xs font-bold uppercase tracking-wider text-gray-500">
								Shared component demo
							</p>
							<h1 className="max-w-3xl text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl text-black">
								A header and footer preview page built from shared components.
							</h1>
							<p className="max-w-2xl text-base leading-7 text-gray-600 sm:text-lg">
								This page is only for previewing the components you asked for. It keeps the app layout unchanged while showing the brand block, navigation menu, icon buttons, and footer structure in one place.
							</p>
						</div>

						<div className="rounded-2xl border border-gray-200 bg-gray-50 p-6 shadow-sm">
							<div className="grid gap-4">
								{featureCards.map((card) => (
									<article key={card.title} className="rounded-lg border border-gray-200 bg-white p-4">
										<h2 className="text-base font-bold text-black">{card.title}</h2>
										<p className="mt-2 text-sm leading-6 text-gray-600">{card.description}</p>
									</article>
								))}
							</div>
						</div>
					</div>
				</Container>
			</section>

			{/* Features section */}
			<section className="mt-10">
				<Container>
					<div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
						{['Khám phá', 'Giải pháp dinh dưỡng', 'Tin tức nổi bật'].map((title) => (
							<div key={title} className="rounded-lg border border-gray-200 bg-gray-50 p-6">
								<h3 className="text-lg font-bold text-black">{title}</h3>
								<p className="mt-3 text-sm leading-6 text-gray-600">
									Placeholder content for the demo page so the header and footer can be reviewed in context.
								</p>
							</div>
						))}
					</div>
				</Container>
			</section>

			{/* Background demo section */}
			<section className="bg-gray-100 py-20 mt-12 lg:mt-16">
				<Container>
					<div className="rounded-xl bg-white p-8 shadow-lg">
						<h2 className="text-2xl font-bold">Background Wrapper Demo</h2>
						<p className="mt-4 text-gray-600">
							This section has a full-width gray background, but the content is constrained
							by the Container component which reads its max-width and padding from the layout variables.
							The white box is an inner element styled independently of the container.
						</p>
					</div>
				</Container>
			</section>
		</>
	)
}
