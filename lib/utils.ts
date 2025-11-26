import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Problem types for repair requests
export const PROBLEM_TYPES = [
  "System Crashing or Blue Screen errors (BSOD)",
  "System slow or Overheating",
  "Accidental Damage (Physical damage not covered by standard warranty)",
  "No Boot or System won't boot to Windows (System initiates startup but fails to load the operating system)",
  "No POST or Startup related issue (System fails the Power-On Self-Test)",
  "No Power or System won't power on (System is completely unresponsive)",
  "No Video, Distorted Video or laptop display issues",
  "Display dead pixels or lines",
  "External Monitor Connectivity Issues",
  "Keyboard (Keys not working, stuck keys, incorrect input)",
  "Mouse (Inaccurate tracking, buttons unresponsive, connection issues)",
  "Touchpad or Trackpad (Unresponsive, erratic movement, gesture issues)",
  "Touchscreen (Unresponsive, ghost touches, calibration issues)",
  "Peripheral Connectivity Issue or System Ports (USB, HDMI, audio ports not working)",
  "Audio Issues or Microphone (No sound, static, poor quality, microphone not detected)",
  "Camera or Webcam (Not detected, poor image quality, drivers)",
  "Hard Drive Related (Failure, bad sectors, partitions, recognized/not recognized)",
  "Hardware Noise (Fan noise, coil whine, clicking from drives)",
  "Memory (RAM) Errors (System instability due to faulty RAM)",
  "Optical Drive (CD/DVD/Blu-ray) Issues (Not reading discs, not ejecting)",
  "Servers (Specific issues related to server hardware or OS)",
  "Internet or Bluetooth (Wi-Fi disconnection, slow speeds, Bluetooth pairing failure)",
  "Network Cable (Ethernet) Connectivity Issues",
  "VPN/Remote Access Issues",
  "Battery or Charging (Battery not holding a charge, not charging, adapter issues)",
  "AC Adapter/Power Supply Failure",
  "Operating System Corruption (General software malfunction or corruption)",
  "Driver Issues (Incorrect, corrupt, or missing drivers)",
  "Virus, Malware, or Spyware Infection",
  "Application Crashing or Errors (Specific software not working)",
  "User Account or Login Issues",
  "System Updates/Patching Failure",
] as const;

export type ProblemType = (typeof PROBLEM_TYPES)[number];
