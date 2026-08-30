import { Component, ErrorInfo, ReactNode } from 'react';
type Props = { children: ReactNode };
type State = { hasError: boolean };
export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };
  static getDerivedStateFromError(): State { return { hasError: true }; }
  componentDidCatch(error: Error, info: ErrorInfo) { console.error('Application render error', error, info.componentStack); }
  render() {
    if (!this.state.hasError) return this.props.children;
    return <main className='min-h-screen flex items-center justify-center p-6'><div className='text-center'><h1 className='text-2xl font-semibold'>Something went wrong</h1><p className='mt-2 text-gray-600'>The page could not be displayed.</p><button className='mt-5 px-4 py-2 bg-gray-900 text-white rounded' onClick={() => window.location.reload()}>Reload page</button></div></main>;
  }
}
