import React from 'react';
import { Stack } from "expo-router";
import { EditorProvider } from "../contexts/EditorContext";
import "./globals.css";

export default function RootLayout() {
  return (
    <EditorProvider>
      <Stack>
        <Stack.Screen
          name="index"
          options={{
            headerShown: false,
          }}
        />
      </Stack>
    </EditorProvider>
  );
}
