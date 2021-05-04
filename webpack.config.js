const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

// const productionConfig = merge([
//   {
//     output: {

//       publicPath: "/",


//       // Tweak this to match your GitHub project name
//       publicPath: "/webpack-demo/",

//     },
//   },
//   ...
// ]);

module.exports = {
  mode: 'development',
  entry: {
    index: './src/index.js',
  },
  devtool: 'inline-source-map',
  devServer: {
    contentBase: './dist',
  },
  plugins: [
    new CleanWebpackPlugin({ cleanStaleWebpackAssets: false }),
    new HtmlWebpackPlugin({
      title: 'GLORP',
      template: './src/index.html'
    }),

  ],
  output: {
    filename: 'bundle.js', // '[name].bundle.js',
    path: path.resolve(__dirname, 'dist'),
    publicPath: '/static/',
  },
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader'],
        
      },
     
      {
        test: /\.(png|svg|jpg|jpeg|gif)$/i,
        type: 'asset/resource',
      },

      {
        test: /\.(gltf)$/,
        use: [
          {
            loader: "gltf-webpack-loader"
          }
        ]
      },
    
      {
        test: /\.(bin|glb)$/,
        use: [
          {
            loader: 'file-loader',
            options: {}
          }
        ]
      },
      
    ]
  }

 
};