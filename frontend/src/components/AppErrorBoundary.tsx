import { Component, ReactNode } from "react";

type Props = {
  children: ReactNode;
};

type State = {
  hasError: boolean;
  message: string;
};

export class AppErrorBoundary extends Component<Props, State> {
  state: State = {
    hasError: false,
    message: ""
  };

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      message: error.message || "알 수 없는 오류가 발생했습니다."
    };
  }

  componentDidCatch(error: Error) {
    console.error("LifeMaker runtime error:", error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="grid min-h-screen place-items-center bg-night px-6 text-ink">
          <div className="max-w-lg rounded-[32px] border border-slate-800 bg-card p-8 text-center shadow-glow">
            <p className="font-display text-3xl text-white">화면을 불러오지 못했습니다</p>
            <p className="mt-3 text-sm text-slate-400">방금 변경한 기능 중 하나에서 오류가 발생했습니다. 새로고침 후 다시 시도해보세요.</p>
            <div className="mt-5 rounded-2xl bg-slate-900/80 px-4 py-3 text-left text-sm text-rose-200">{this.state.message}</div>
            <button className="mt-5 rounded-2xl bg-accent px-4 py-3 font-semibold text-slate-950" onClick={() => window.location.reload()}>
              새로고침
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
