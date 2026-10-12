import { RouterProvider } from 'react-router-dom'
import { TooltipProvider } from '@/components/ui/tooltip'
import { ErrorBoundary, ErrorHandlerProvider } from '@/lib/error-handler'
import router from './routers/routes'

function App() {
  return (
    <TooltipProvider>
      <ErrorHandlerProvider
        loggerFn={(error) => {
          console.error('Logged application error:', error)
        }}
      >
        <ErrorBoundary>
          <RouterProvider router={router} />
        </ErrorBoundary>
      </ErrorHandlerProvider>
    </TooltipProvider>
  )
}

export default App
