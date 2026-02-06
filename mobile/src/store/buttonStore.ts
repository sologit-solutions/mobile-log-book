import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface ActionButton {
    id: string;
    label: string;
}

interface ButtonState {
    buttons: ActionButton[];
    addButton: (label: string) => void;
    removeButton: (id: string) => void;
    resetToDefaults: () => void;
}

const DEFAULT_BUTTONS = [
    {id: "1", label: "Hoist sails"},
    {id: "2", label: "Lower sails"},
    {id: "3", label: "Hoist anchor"},
    {id: "4", label: "Lower anchor"},
    {id: "5", label: "Engine on"},
    {id: "6", label: "Engine off"},
    {id: "7", label: "Refuel"},
    {id: "8", label: "Other log entry"},
]

export const useButtonStore = create<ButtonState>()(
    persist(
        (set) => ({
            buttons: DEFAULT_BUTTONS,

            addButton: (label) => set((state) => ({
                buttons: [
                    ...state.buttons,
                    {id: Date.now().toString(), label}
                ]
            })),

            removeButton: (id) => set((state) => ({
                buttons: state.buttons.filter(button => button.id !== id),
            })),

            resetToDefaults: () => set({ buttons: DEFAULT_BUTTONS }),
        }),
        {
            name: "button-storage",
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
)