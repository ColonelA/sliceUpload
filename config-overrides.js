const { 
  override,    
  addLessLoader,
  fixBabelImports, 
  adjustStyleLoaders
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
)

