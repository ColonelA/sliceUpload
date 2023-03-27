const { 
  override,    
  addLessLoader,
  fixBabelImports, 
  adjustStyleLoaders, 
  addWebpackModuleRule,
 } = require('customize-cra');


module.exports= override(
    addLessLoader({ 
        lessOptions: {
            javascriptEnabled: true,
            modifyVars: { "@primary-color": "#13c2c2" },
        },
    }),  
    adjustStyleLoaders(({ use: [, , postcss] }) => {
        const postcssOptions = postcss.options;
        postcss.options = { postcssOptions };
    }),
    fixBabelImports('import', {
        libraryName: 'antd',
        libraryDirectory: 'es',
        style: 'css',
    }), 
    addWebpackModuleRule({
        test: /\.worker\.(c|m)?js$/i,
        use: [
        {
          loader: 'worker-loader',   
          
        },{
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'],
          },
        }]
 
    })
)

