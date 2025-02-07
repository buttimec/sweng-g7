import React from 'react';
import { View, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';

//Need the Google Maps API Key inserted below to progress this page

export default function MapPage() {
  return (
    <View style={styles.container}>
      <WebView
        source={{
          html: `
            <html>
              <head>
                <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0">
                <style>
                  body, html { margin: 0; padding: 0; height: 100%; overflow: hidden; }
                  iframe { width: 100%; height: 100%; border: 0; }
                </style>
              </head>
              <body>
                <iframe 
                  src="INSERT API KEY HERE WHEN WE HAVE IT" 
                  allowfullscreen>
                </iframe>
              </body>
            </html>
          `,
        }}
        style={styles.webview}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  webview: {
    flex: 1,
  },
});
