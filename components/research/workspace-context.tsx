'use client';
import {createContext,useContext} from 'react';
export type View='screen'|'diagnosis'|'events';
export type ScreenSummary={intent:string;rules:string;conditions:number;counts:{included:number;excluded:number;unknown:number}};
export type ResearchContext={request:{question:string;id:number}|null;screen:ScreenSummary|null;event:string;updateScreen:(summary:ScreenSummary)=>void;updateEvent:(summary:string)=>void};
export const Research=createContext<ResearchContext|null>(null);
export const useResearch=()=>useContext(Research);
