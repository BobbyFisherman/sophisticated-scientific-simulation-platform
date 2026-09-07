import { createContext, useContext, useState, ReactNode } from "react";
import { DEFAULT_INPUTS, SystemInputs, massToLuminosity } from "./astro";

interface SystemCtx {
  inp: SystemInputs;
  set: (patch: Partial<SystemInputs>) => void;
  load: (inputs: SystemInputs) => void;
  reset: () => void;
  activePreset: string;
  setActivePreset: (id: string) => void;
}

const Ctx = createContext<SystemCtx | null>(null);

export function SystemProvider({ children }: { children: ReactNode }) {
  const [inp, setInp] = useState<SystemInputs>(DEFAULT_INPUTS);
  const [activePreset, setActivePreset] = useState("earth");

  const set = (patch: Partial<SystemInputs>) => {
    // moving the stellar-mass slider recalibrates luminosity via the M–L relation
    if (patch.starMass !== undefined && patch.luminosity === undefined) {
      patch.luminosity = massToLuminosity(patch.starMass);
    }
    setInp((s) => ({ ...s, ...patch }));
    setActivePreset("custom");
  };
  const load = (inputs: SystemInputs) => setInp({ ...inputs });
  const reset = () => { setInp(DEFAULT_INPUTS); setActivePreset("earth"); };

  return <Ctx.Provider value={{ inp, set, load, reset, activePreset, setActivePreset }}>{children}</Ctx.Provider>;
}

export function useSystem(): SystemCtx {
  const c = useContext(Ctx);
  if (!c) throw new Error("useSystem outside provider");
  return c;
}
