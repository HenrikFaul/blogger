import { Component, type ErrorInfo, type ReactNode } from "react";
import { STORAGE_KEY } from "../../lib/creator/model";
import { download } from "../../lib/creator/zip";
interface Props {
  children?: ReactNode;
  fallback?: ReactNode;
  onReset?: () => void;
}
export class ErrorBoundary extends Component<
  Props,
  { error: Error | null; exportError: string }
> {
  state = { error: null as Error | null, exportError: "" };
  static getDerivedStateFromError(error: Error) {
    return { error };
  }
  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("ForgeBlog render error", error, info);
  }
  rescue = () => {
    try {
      download(
        JSON.stringify(
          {
            current: localStorage.getItem(STORAGE_KEY),
            legacy: localStorage.getItem("forge-local-drafts"),
          },
          null,
          2,
        ),
        "forgeblog-emergency-recovery.json",
        "application/json",
      );
    } catch {
      this.setState({
        exportError:
          "A böngésző nem enged hozzáférést a helyi tárolóhoz. Ne töröld a webhely adatait.",
      });
    }
  };
  render() {
    if (!this.state.error) return this.props.children;
    if (this.props.fallback) return this.props.fallback;
    return (
      <main className="container" style={{ paddingBlock: 80, maxWidth: 720 }}>
        <p className="eyebrow">A HELYI ADATOKAT NEM TÖRÖLTÜK</p>
        <h1>A munkatér megjelenítése megszakadt.</h1>
        <p style={{ marginBlock: 24 }}>
          Először mentsd ki a legutóbb tárolt vázlatokat. Ez a vészexport a
          szöveges tárolót tartalmazza, a képfájlokat nem. A hiba előtti, még
          nem mentett módosítások nem feltétlenül kerülnek bele. Ne töröld a
          böngésző webhelyadatait.
        </p>
        <div className="inline-stack">
          <button
            type="button"
            className="btn btn-primary"
            onClick={this.rescue}
          >
            Tárolt vázlatok vészexportja
          </button>
          <button
            type="button"
            className="btn btn-outline"
            onClick={() => {
              this.setState({ error: null });
              this.props.onReset?.();
            }}
          >
            Megjelenítés újrapróbálása
          </button>
        </div>
        {this.state.exportError && <p role="alert">{this.state.exportError}</p>}
        <details style={{ marginTop: 24 }}>
          <summary>Technikai hiba</summary>
          <pre style={{ whiteSpace: "pre-wrap" }}>
            {this.state.error.message}
          </pre>
          <p>
            A hiba helyben került naplózásra. Nem küldtük automatikusan külső
            szolgáltatásnak.
          </p>
        </details>
      </main>
    );
  }
}
