export interface FAQ {
  q: string;
  a: string;
  iconName: "Shield" | "Wifi" | "HardDrive" | "Brain";
}

export const faqs: FAQ[] = [
  {
    q: "Is it safe to run?",
    a: "Yes. The scanner is open-source, runs entirely on your machine, and only reads hardware info \u2014 it cannot modify, install, or delete anything. The JSON output contains no personal data, just component specs and temperatures.",
    iconName: "Shield",
  },
  {
    q: "Does it need internet?",
    a: "The scanner itself works offline and saves results to your Desktop. You only need internet to upload the JSON file to our dashboard for analysis. The AI analysis requires an internet connection.",
    iconName: "Wifi",
  },
  {
    q: "What Windows versions are supported?",
    a: "Windows 10 and Windows 11 (64-bit). The scanner uses WMI and standard Windows APIs. It must be run as Administrator to access detailed hardware info like temperatures and BIOS settings.",
    iconName: "HardDrive",
  },
  {
    q: "How accurate is the AI analysis?",
    a: "The AI analysis is powered by Claude and references your exact hardware specs, current drivers, BIOS settings, and temperatures. It cross-references a database of 176+ CPUs and GPUs to give you specific, actionable recommendations \u2014 not generic advice.",
    iconName: "Brain",
  },
];
