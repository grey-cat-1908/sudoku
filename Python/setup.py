from setuptools import setup, Extension

module = Extension('sudoku', sources=['sudoku.c'])

setup(
    name='sudoku',
    author_email='mail@mrkrk.me',
    license='MIT',
    url='https://github.com/grey-cat-1908/sudoku',
    version='1.0a0',
    description='Sudoku file handling Python module.',
    ext_modules=[module]
)