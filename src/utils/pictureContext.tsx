
'use client';


import { IFSPicture } from '../types';
import {useContext, createContext, useState} from 'react';

/* 
interface PictureContextProps {
    selectedPicture?: IFSPicture;
    setSelectedPicture: (picture: IFSPicture) => void;
}

export const PictureContext = createContext<PictureContextProps>({
    selectedPicture: undefined,
    setSelectedPicture: () => {},
});

export const usePictureContext = () => useContext(PictureContext);

export const PictureProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [selectedPicture, setSelectedPicture] = useState<IFSPicture | undefined>(undefined);

    return (
        <PictureContext value={{ selectedPicture, setSelectedPicture }}>
            {children}
        </PictureContext>
    );
}
*/

export const PictureContext = createContext<{
    pictures: IFSPicture[], 
    setPictures: React.Dispatch<React.SetStateAction<IFSPicture[]>>, 
    selectedPicture?: IFSPicture, 
    setSelectedPicture: (picture: IFSPicture) => void   
}>({
    pictures: [],
    setPictures: () => {},
    selectedPicture: undefined,
    setSelectedPicture: () => {},
});

export const usePictureContext = () => useContext(PictureContext);

export const PictureProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [pictures, setPictures] = useState<IFSPicture[]>([]);
    const [selectedPicture, setSelectedPicture] = useState<IFSPicture | undefined>(undefined);

    return (
        <PictureContext value={{ pictures, setPictures, selectedPicture, setSelectedPicture }}>
            {children}
        </PictureContext>
    );
}