function isDigit(charac) {
  for (let i = 0; i <= 9; i++) {
    if (charac == '' + i) {
      return true
    }
  }
  return false
}

const getCoords = (line) => {
  const coords = [0, 0, 0]
  let pointeur = 0
  let i = 0
  let temp = ''

  while (pointeur <= 2 && i < line.length) {
    if (line[i] === '-' || (line[i] === '.' && isDigit(line[i + 1])) || isDigit(line[i])) {
      temp += line[i]
    } else if (temp !== '' && line[i] === ' ') {
      coords[pointeur] = parseFloat(temp)
      temp = ''
      pointeur += 1
    }
    i += 1
  }

  return coords
}

const getCoordsFa = (line) => {
  const coords = [[0, 0], [0, 0], 0]
  let compteur = 0
  let i = 0
  let temp = ''

  while (compteur <= 6 && i < line.length) {
    if (line[i] === '-' || (line[i] === '.' && isDigit(line[i + 1])) || isDigit(line[i])) {
      temp += line[i]
    }
    if ((temp !== '' && line[i] === ' ') || i === line.length - 1) {
      switch (compteur) {
        case 2:
          coords[2] = parseFloat(temp)
          break
        case 3:
          coords[0][0] = parseFloat(temp)
          break
        case 4:
          coords[0][1] = parseFloat(temp)
          break
        case 5:
          coords[1][0] = parseFloat(temp)
          break
        case 6:
          coords[1][1] = parseFloat(temp)
          break
      }
      temp = ''
      compteur += 1
    }
    i += 1
  }

  return coords
}

const getCoordsFl = (line) => {
  let coords = [
    [0, 0],
    [0, 0]
  ]
  let compteur = 0
  let i = 0
  let temp = ''

  while (compteur <= 6 && i < line.length) {
    if (line[i] === '-' || (line[i] === '.' && isDigit(line[i + 1])) || isDigit(line[i])) {
      temp += line[i]
    }
    if (temp !== '' && (line[i] === ' ' || i === line.length - 1)) {
      switch (compteur) {
        case 3:
          coords[0][0] = parseFloat(temp)
          break
        case 4:
          coords[0][1] = parseFloat(temp)
          break
        case 5:
          coords[1][0] = parseFloat(temp)
          break
        case 6:
          coords[1][1] = parseFloat(temp)
          break
      }
      temp = ''
      compteur += 1
    }
    i += 1
  }

  return coords
}

let forbiddenLines = []
let forbiddenAreas = []
let interestPoints = []

const updateInfos = async () => {
  const url =
    'https://raw.githubusercontent.com/PIDR-2023/PIDR/traitement_map/application/map_loria.txt'
  try {
    const response = await fetch(url)
    const content = await response.text()
    const lines = content.split('\n')
    for (const line of lines) {
      if (line.startsWith('Cairn:')) {
        if (line.includes('ForbiddenLine')) {
          forbiddenLines.push(getCoordsFl(line))
        } else if (line.includes('ForbiddenArea')) {
          forbiddenAreas.push(getCoordsFa(line))
        } else {
          interestPoints.push(getCoords(line))
        }
      }
    }
  } catch (err) {
    console.error('Error fetching file:', err)
  }
}

const minPos = { x: -6260, y: -17580 }
const maxPos = { x: 10440, y: 31820 }

document.addEventListener('DOMContentLoaded', function () {
  const canvas = document.getElementById('mapCanvas')
  const ctx = canvas.getContext('2d')

  function tailleEtTracer() {
    canvas.width = window.innerWidth * 0.9
    canvas.height = window.innerHeight * 0.9
    updateInfos().then(() => {
      console.log(forbiddenAreas, '\n\n\n', forbiddenLines, '\n\n\n', interestPoints)

      const scaleX = canvas.width / (maxPos.x - minPos.x)
      const scaleY = canvas.height / (maxPos.y - minPos.y)
      const scale = Math.min(scaleX, scaleY)

      function transformCoord(x, y) {
        return {
          x: (x - minPos.x) * scale,
          y: (y - minPos.y) * scale
        }
      }

      interestPoints.forEach((point) => {
        const transformed = transformCoord(point[0], point[1])
        ctx.fillStyle = 'blue'
        ctx.beginPath()
        ctx.arc(transformed.x, transformed.y, 5, 0, 2 * Math.PI)
        ctx.fill()
      })

      forbiddenLines.forEach((line) => {
        const start = transformCoord(line[0][0], line[0][1])
        const end = transformCoord(line[1][0], line[1][1])
        ctx.strokeStyle = 'red'
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.moveTo(start.x, start.y)
        ctx.lineTo(end.x, end.y)
        ctx.stroke()
      })

      forbiddenAreas.forEach((area) => {
        const topLeft = transformCoord(area[0][0], area[0][1])
        const bottomRight = transformCoord(area[1][0], area[1][1])
        ctx.fillStyle = 'rgba(255, 0, 0, 0.5)'
        ctx.beginPath()
        ctx.rect(topLeft.x, topLeft.y, bottomRight.x - topLeft.x, bottomRight.y - topLeft.y)
        ctx.fill()
        ctx.strokeStyle = 'red'
        ctx.stroke()
      })
    })
  }

  tailleEtTracer()
  window.addEventListener('resize', tailleEtTracer)
})
