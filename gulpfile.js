'use strict';

const del = require('del');
const gulp = require('gulp');
const gulplog = require('gulplog');
const browserSync = require('browser-sync');
const webpackStream = require('webpack-stream');
const webpack = webpackStream.webpack;

const plumber = require('gulp-plumber');
const notify = require('gulp-notify');
const named = require('vinyl-named');

let isDevelopment = true;

gulp.task('serve', function() {
  browserSync.init({
    proxy: 'localhost:8000'
  });

  browserSync.watch('app/static/**/*.*').on('change', browserSync.reload);
  browserSync.watch('app/views/**/*.*').on('change', browserSync.reload);
});

gulp.task('html', () => {
	return gulp.src('./src/index.html')
		.pipe(gulp.dest('./app/static'))
});

gulp.task('img', () => {
	return gulp.src('./src/img/**/*.*')
		.pipe(gulp.dest('./app/static/img'))
});

gulp.task('webpack', (callback) => {
	let firstBuildComplete = false;

	function done (err, stats) {
		firstBuildComplete = true;

		if (err) return;

		gulplog[stats.hasErrors() ? 'error' : 'info'](stats.toString({
			colors: true
		}));
	}

	const options = {
		watch: true,
		devtool: isDevelopment ? 'cheap-source-map' : null,
		module: {
			rules: [{
				test: /\.js/,

				use: {
					loader: 'babel-loader',
					options: {
						presets: ['es2015', 'react']
					}
				}
			}]
		},

		watchOptions: {
			aggregateTimeout: 100,
		},

		plugins: []
	};

	return gulp.src('./src/scripts/*.js')
		.pipe(plumber({
			erroHandler: notify.onError(err => ({
				title: 'Webpack',
				message: err.message
			}))
		}))
		.pipe(named())
		.pipe(webpackStream(options, null, done))
		.pipe(gulp.dest('./app/static/scripts/'))
		.on('data', () => {
			if (firstBuildComplete) {
				callback();
			}
		})
});

gulp.task('clean', () => {
  return del(['app/static']);
});

gulp.task('build', gulp.series('clean', gulp.parallel('html', 'webpack', 'img')));

gulp.task('dev', gulp.series(
	'build',

	gulp.parallel(
		'serve',
		function () {
			gulp.watch('./src/index.html', gulp.series('html'));
		}
	)
));

// gulp.task('build', gulp.series('clean', gulp.parallel('styles:assets', 'styles', 'webpack'), 'assets'));
// gulp.task('dev',
//     gulp.series(
//         'build',
//         gulp.parallel(
//             'serve',
//             function() {
//               gulp.watch('frontend/styles/**/*.styl', gulp.series('styles'));
//               gulp.watch('frontend/assets/**/*.*', gulp.series('assets'));
//               gulp.watch('frontend/styles/**/*.{svg,png}', gulp.series('styles:assets'));
//             }
//         )
//     )
// );