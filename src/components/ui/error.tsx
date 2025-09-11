import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle, RefreshCw, Home, ArrowLeft } from "lucide-react"
import Link from "next/link"

interface ErrorProps {
  title?: string
  message: string
  showRetry?: boolean
  onRetry?: () => void
  showHome?: boolean
  showBack?: boolean
  onBack?: () => void
  className?: string
}

export function ErrorMessage({ 
  title = "אירעה שגיאה",
  message,
  showRetry = false,
  onRetry,
  showHome = false,
  showBack = false,
  onBack,
  className
}: ErrorProps) {
  return (
    <Alert variant="destructive" className={className}>
      <AlertTriangle className="h-4 w-4" />
      <AlertDescription>
        <div className="space-y-2">
          <p className="font-medium">{title}</p>
          <p>{message}</p>
          <div className="flex gap-2 pt-2">
            {showRetry && onRetry && (
              <Button
                variant="outline"
                size="sm"
                onClick={onRetry}
                className="h-8"
              >
                <RefreshCw className="h-3 w-3 mr-1" />
                נסה שוב
              </Button>
            )}
            {showHome && (
              <Button asChild variant="outline" size="sm" className="h-8">
                <Link href="/">
                  <Home className="h-3 w-3 mr-1" />
                  עמוד הבית
                </Link>
              </Button>
            )}
            {showBack && onBack && (
              <Button
                variant="outline"
                size="sm"
                onClick={onBack}
                className="h-8"
              >
                <ArrowLeft className="h-3 w-3 mr-1" />
                חזור
              </Button>
            )}
          </div>
        </div>
      </AlertDescription>
    </Alert>
  )
}

export function ErrorPage({ 
  title = "אירעה שגיאה",
  message,
  showRetry = false,
  onRetry,
  showHome = true,
  showBack = false,
  onBack
}: ErrorProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-red-100 rounded-full">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <CardTitle className="text-center text-xl">{title}</CardTitle>
            <CardDescription className="text-center">{message}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col gap-2">
              {showRetry && onRetry && (
                <Button onClick={onRetry} className="w-full">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  נסה שוב
                </Button>
              )}
              {showHome && (
                <Button asChild variant="outline" className="w-full">
                  <Link href="/">
                    <Home className="h-4 w-4 mr-2" />
                    עמוד הבית
                  </Link>
                </Button>
              )}
              {showBack && onBack && (
                <Button
                  variant="outline"
                  onClick={onBack}
                  className="w-full"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  חזור
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export function EmptyState({ 
  title = "אין נתונים",
  message = "לא נמצאו נתונים להצגה",
  action,
  icon: Icon
}: {
  title?: string
  message?: string
  action?: React.ReactNode
  icon?: React.ComponentType<{ className?: string }>
}) {
  return (
    <div className="text-center py-12">
      {Icon && (
        <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-gray-100 rounded-full">
          <Icon className="h-6 w-6 text-gray-400" />
        </div>
      )}
      <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-500 mb-6">{message}</p>
      {action}
    </div>
  )
}
