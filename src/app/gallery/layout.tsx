
'use client';
    
import { PictureProvider } from "@/src/utils/pictureContext";


export default function PictureLayout({ children }: { children: React.ReactNode }) {

    return (
        <PictureProvider>
            {children}
        </PictureProvider>
    );
}