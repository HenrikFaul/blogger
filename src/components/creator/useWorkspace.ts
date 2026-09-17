import { useCallback, useEffect, useRef, useState } from "react";
import { STORAGE_KEY, type Workspace } from "../../lib/creator/model";
import {
  emptyWorkspace,
  parseWorkspace,
  persistWorkspace,
  readWorkspace,
} from "../../lib/creator/storage";
export function useWorkspace(themeKey: string) {
  const [workspace, setWorkspace] = useState<Workspace>(() =>
    emptyWorkspace(themeKey),
  );
  const value = useRef(workspace),
    expected = useRef(0),
    writer = useRef(""),
    dirty = useRef(false),
    blocked = useRef(false),
    saving = useRef<Promise<boolean> | null>(null);
  const [loaded, setLoaded] = useState(false),
    [version, setVersion] = useState(0),
    [state, setState] = useState<"loading" | "saved" | "pending" | "error">(
      "loading",
    ),
    [error, setError] = useState("");
  useEffect(() => {
    writer.current = crypto.randomUUID();
    try {
      const next = readWorkspace(localStorage, themeKey);
      value.current = next;
      expected.current = next.revision;
      setWorkspace(next);
      setState("saved");
    } catch (e) {
      blocked.current = true;
      setError(
        e instanceof Error ? e.message : "A helyi mentés nem olvasható.",
      );
      setState("error");
    }
    setLoaded(true);
    const onStorage = (event: StorageEvent) => {
      if (event.key !== STORAGE_KEY) return;
      try {
        const remote = event.newValue
          ? parseWorkspace(event.newValue)
          : emptyWorkspace(themeKey);
        if (remote.writer === writer.current) return;
        if (dirty.current) {
          blocked.current = true;
          setError(
            "Egy másik böngészőfül módosította a munkateret. A mentést megállítottuk, a nyitott változatod megmaradt. Exportálj biztonsági másolatot, majd töltsd be a másik fül változatát.",
          );
          setState("error");
        } else {
          value.current = remote;
          expected.current = remote.revision;
          setWorkspace(remote);
        }
      } catch {
        blocked.current = true;
        setError("A másik böngészőfül sérült adatot írt. A mentés szünetel.");
        setState("error");
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [themeKey]);
  const update = useCallback((fn: (current: Workspace) => Workspace) => {
    const next = fn(value.current);
    value.current = next;
    dirty.current = true;
    setWorkspace(next);
    setVersion((v) => v + 1);
    if (!blocked.current) setState("pending");
  }, []);
  const flush = useCallback(async (): Promise<boolean> => {
    if (blocked.current) return false;
    if (saving.current) {
      await saving.current;
      if (dirty.current) return flush();
      return true;
    }
    if (!dirty.current) return true;
    const target = value.current;
    const execute = () => {
      try {
        const next = persistWorkspace(
          localStorage,
          target,
          expected.current,
          writer.current,
        );
        expected.current = next.revision;
        if (value.current === target) {
          value.current = next;
          dirty.current = false;
          setWorkspace(next);
          setState("saved");
        } else {
          value.current = {
            ...value.current,
            revision: next.revision,
            savedAt: next.savedAt,
            writer: next.writer,
          };
          setWorkspace(value.current);
          setState("pending");
        }
        setError("");
        return true;
      } catch (e) {
        const msg =
          e instanceof Error ? e.message : "Ismeretlen tárolási hiba.";
        if (msg.startsWith("CONFLICT")) blocked.current = true;
        setError(
          msg.startsWith("CONFLICT")
            ? "Másik böngészőfül mentett. Exportáld a változatodat, mielőtt betöltöd a frissebb munkateret."
            : `Nem sikerült menteni. A munka egyelőre csak a memóriában van. Exportálj biztonsági másolatot! (${msg})`,
        );
        setState("error");
        return false;
      }
    };
    const promise = (async () =>
      navigator.locks
        ? await navigator.locks.request(
            STORAGE_KEY,
            { mode: "exclusive" },
            execute,
          )
        : execute())();
    saving.current = promise;
    try {
      return await promise;
    } finally {
      saving.current = null;
    }
  }, []);
  useEffect(() => {
    if (!loaded || !dirty.current) return;
    const timer = setTimeout(() => void flush(), 650);
    return () => clearTimeout(timer);
  }, [version, loaded, flush]);
  useEffect(() => {
    const visible = () => {
      if (document.visibilityState === "hidden") void flush();
    };
    const unload = (e: BeforeUnloadEvent) => {
      if (dirty.current) {
        e.preventDefault();
        // Keep legacy beforeunload support without depending on its deprecated TS declaration.
        (e as unknown as {returnValue:string}).returnValue = "";
      }
    };
    document.addEventListener("visibilitychange", visible);
    window.addEventListener("beforeunload", unload);
    return () => {
      document.removeEventListener("visibilitychange", visible);
      window.removeEventListener("beforeunload", unload);
    };
  }, [flush]);
  const reload = useCallback(() => {
    try {
      const next = readWorkspace(localStorage, themeKey);
      value.current = next;
      expected.current = next.revision;
      dirty.current = false;
      blocked.current = false;
      setWorkspace(next);
      setError("");
      setState("saved");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Nem olvasható a mentés.");
    }
  }, [themeKey]);
  return { workspace, update, flush, reload, loaded, state, error };
}
