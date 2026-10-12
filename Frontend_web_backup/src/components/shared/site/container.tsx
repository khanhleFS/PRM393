import React from 'react'
import { cn } from '@/lib/utils'

interface ContainerProps {
	children: React.ReactNode
	className?: string
}

/**
 * A simplified content wrapper that reads layout constraints from CSS variables.
 * Use --content-px for horizontal padding and --content-max-w for max-width.
 */
export const Container = React.forwardRef<HTMLDivElement, ContainerProps>(
	({ children, className }, ref) => {
		return (
			<div
				ref={ref}
				className={cn(
					'mx-auto w-full px-[var(--content-padding-x)] max-w-[var(--content-max-width)]',
					className
				)}
			>
				{children}
			</div>
		)
	}
)

Container.displayName = 'Container'

export default Container
