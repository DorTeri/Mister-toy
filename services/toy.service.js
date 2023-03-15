const fs = require('fs')
const toys = require('../data/toy.json')

module.exports = {
  query,
  save,
  remove,
  getById,
}

function query(filterBy) {
  let filteredtoys

  const { name, labels, inStock, pageIdx, pageSize, sortBy } = filterBy
  const { by, desc } = sortBy
  
  const regex = new RegExp(name, 'i')
  filteredtoys = toys.filter(toy => regex.test(toy.name))

  if (filterBy.labels.length > 0) {
    filteredtoys = filteredtoys.filter(toy => toy.labels.some(label => labels.includes(label)))
  }

  if (inStock === 'true') {
    filteredtoys = filteredtoys.filter(toy => toy.inStock)
  }

  if (by) {
    switch (by) {
      case 'name':
        filteredtoys = filteredtoys.sort((t1, t2) => t1.name.localeCompare(t2.name) * +desc)
        break;
      case 'price':
        filteredtoys = filteredtoys.sort((t1, t2) => (t1.price - t2.price) * +desc)
        break;
      case 'created':
        filteredtoys = filteredtoys.sort((t1, t2) => (t1.createdAt - t2.createdAt) * +desc)
        break;
    }
  }

    const startIdx = pageIdx * pageSize
    filteredtoys = filteredtoys.slice(startIdx, startIdx + pageSize)

  return Promise.resolve(filteredtoys)
}


function save(toy) {
  if (toy._id) {
    const idx = toys.findIndex(currtoy => currtoy._id === toy._id)
    if (idx === -1) return Promise.reject('No such toy')
    toys[idx] = toy
  } else {
    toy._id = _makeId()
    toy.createdAt = Date.now()
    toys.push(toy)
  }

  return _savetoysToFile().then(() => toy)
}

function getById(toyId) {
  const toy = toys.find(toy => toy._id === toyId)
  return Promise.resolve(toy)
}

function remove(toyId) {
  const idx = toys.findIndex(toy => toy._id === toyId)
  if (idx === -1) return Promise.reject('No such toy')

  toys.splice(idx, 1)
  return _savetoysToFile()
}

function _makeId(length = 5) {
  let txt = ''
  let possible =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  for (let i = 0; i < length; i++) {
    txt += possible.charAt(Math.floor(Math.random() * possible.length))
  }
  return txt
}

function _savetoysToFile() {
  return new Promise((resolve, reject) => {
    const content = JSON.stringify(toys, null, 2)
    fs.writeFile('./data/toy.json', content, err => {
      if (err) {
        console.error(err)
        return reject(err)
      }
      resolve()
    })
  })
}
